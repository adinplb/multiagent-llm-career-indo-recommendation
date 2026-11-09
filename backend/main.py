"""
FastAPI Entry Point — Indo-Career AI Backend
Serves the LangGraph multi-agent pipeline via HTTP API.
Job data: Tavily real-time search + FAISS semantic embeddings.
"""
import os
import io
import json
import queue
import asyncio
import logging
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
# Konfigurasi terpusat di .env root project (dipakai bersama backend + frontend build-time).
# Path relatif terhadap lokasi file ini, bukan cwd — supaya tetap benar baik dijalankan
# via `uvicorn main:app` dari folder backend/ maupun dari root project.
# Di Docker, env var sudah diteruskan lewat `env_file` di docker-compose.yml sebelum
# proses Python start, jadi load_dotenv() disini murni fallback untuk run manual.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from tools.cv_parser import extract_text_from_pdf
from tools import supabase_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: mode real-time aktif.
    Tavily + FAISS — tidak ada dataset lokal yang di-load.
    """
    logger.info("Indo-Career AI starting up — Tavily + FAISS embeddings mode.")
    yield
    logger.info("Indo-Career AI shutting down.")


app = FastAPI(
    title="Indo-Career AI API",
    description="Multi-Agent Career Recommendation System untuk pasar kerja Indonesia",
    version="2.0.0",
    lifespan=lifespan,
)

cors_allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:8080",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Attachment text extraction helper
# ---------------------------------------------------------------------------

async def extract_attachment_text(files: list[UploadFile]) -> str:
    """
    Ekstrak teks dari file lampiran (PDF, DOCX, TXT).
    Truncate: 5.000 char per file, 15.000 char total.
    """
    if not files:
        return ""

    all_texts = []
    for f in files:
        if not f or not f.filename:
            continue
        try:
            content = await f.read()
            fname = f.filename.lower()

            if fname.endswith(".pdf"):
                text = extract_text_from_pdf(content)
            elif fname.endswith(".docx"):
                from docx import Document
                doc = Document(io.BytesIO(content))
                text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            elif fname.endswith(".txt"):
                text = content.decode("utf-8", errors="ignore")
            else:
                continue

            text = text.strip()[:5000]
            if text:
                all_texts.append(f"[{f.filename}]\n{text}")

        except Exception as e:
            logger.warning("Gagal ekstrak lampiran '%s': %s", f.filename, e)

    combined = "\n\n---\n\n".join(all_texts)
    return combined[:15000]


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    """Returns service status."""
    return {
        "status": "ok",
        "mode": "realtime",
        "job_sources": ["Tavily"],
        "search_backend": "Tavily + FAISS embeddings",
        "llm_providers": {
            "profiler": "Google Gemini",
            "analyst": "Google Gemini",
            "gap_analyzer": "Groq",
            "strategist": "Groq",
        },
        "llm_models": {
            "profiler": os.getenv("PROFILER_MODEL", "gemini-2.5-flash"),
            "analyst": os.getenv("ANALYST_MODEL", "gemini-2.5-flash"),
            "gap_analyzer": os.getenv("GAP_MODEL", "llama-3.3-70b-versatile"),
            "strategist": os.getenv("STRATEGIST_MODEL", "llama-3.3-70b-versatile"),
        },
        "tavily_configured": bool(os.getenv("TAVILY_API_KEY")),
    }


# ---------------------------------------------------------------------------
# Main analysis endpoint
# ---------------------------------------------------------------------------

async def _build_initial_state(
    cv_file: UploadFile,
    target_role: str,
    user_name: str,
    github_url: str,
    additional_context: str,
    extra_files: list[UploadFile],
) -> dict:
    """Validasi CV + konstruksi initial CareerState. Shared oleh /api/analyze dan /api/analyze-stream."""
    if not cv_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya file PDF yang diterima.")

    pdf_bytes = await cv_file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="File PDF kosong.")

    try:
        cv_text = extract_text_from_pdf(pdf_bytes)
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not cv_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Tidak dapat mengekstrak teks dari PDF. Pastikan PDF bukan hasil scan.",
        )

    attachments_text = await extract_attachment_text(extra_files)

    return {
        "cv_text": cv_text,
        "cv_filename": cv_file.filename,
        "target_role": target_role.strip(),
        "user_name": user_name.strip(),
        "github_url": github_url.strip(),
        "additional_context": additional_context.strip(),
        "attachments_text": attachments_text,
        "user_profile": {},
        "market_data": {},
        "skill_gaps": {},
        "roadmap": "",
        "messages": [],
        "error": "",
        "status": "Memulai...",
    }


@app.post("/api/analyze")
async def analyze_career(
    cv_file: UploadFile = File(..., description="CV dalam format PDF"),
    target_role: str = Form(..., description="Posisi yang dituju"),
    user_name: str = Form(default="", description="Nama pengguna"),
    github_url: str = Form(default="", description="URL GitHub (opsional)"),
    additional_context: str = Form(default="", description="Konteks tambahan: preferensi, minat, tujuan karier"),
    extra_files: list[UploadFile] = File(default=[], description="File lampiran tambahan: PDF, DOCX, TXT"),
):
    """
    Main endpoint: menerima CV PDF + konteks, menjalankan LangGraph multi-agent pipeline.

    Graph flow:
      coordinator → [profiler ∥ analyst] → gap_analyzer → strategist
    """
    initial_state = await _build_initial_state(
        cv_file, target_role, user_name, github_url, additional_context, extra_files,
    )

    from graph import career_graph

    logger.info(
        "Mulai analisis '%s' — CV: %s | konteks: %d chars | lampiran: %d chars",
        target_role, cv_file.filename, len(additional_context), len(initial_state["attachments_text"]),
    )

    loop = asyncio.get_event_loop()
    try:
        final_state = await loop.run_in_executor(
            None,
            lambda: career_graph.invoke(initial_state),
        )
    except Exception as e:
        logger.error("Graph execution error: %s", e)
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan sistem: {str(e)}")

    if final_state.get("error"):
        logger.warning("Graph selesai dengan error: %s", final_state["error"])

    response = _build_client_response(final_state)

    logger.info(
        "Analisis selesai — match: %s%%",
        final_state.get("skill_gaps", {}).get("persentase_kecocokan", "N/A"),
    )
    return response


# ---------------------------------------------------------------------------
# Streaming analysis endpoint (SSE — progress real-time per-agent)
# ---------------------------------------------------------------------------

# Label & pesan tahap untuk UI, dipetakan dari nama node LangGraph asli.
_STAGE_LABELS = {
    "coordinator": "Validasi Input",
    "profiler": "Profiler & Market Analyst",
    "analyst": "Profiler & Market Analyst",
    "gap_analyzer": "Gap Analyzer",
    "strategist": "Strategist",
}
# Node yang digabung jadi satu tahap UI (fan-out paralel) — tahap ini "done"
# hanya setelah SEMUA node dalam grup ini muncul di stream.
_STAGE_GROUPS = {
    "coordinator": {"coordinator"},
    "profiler": {"profiler", "analyst"},
    "gap_analyzer": {"gap_analyzer"},
    "strategist": {"strategist"},
}


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


# Field CareerState yang boleh dikirim ke client — allow-list eksplisit agar
# field baru yang ditambahkan ke CareerState di masa depan tidak otomatis
# ter-expose ke browser tanpa peninjauan.
_CLIENT_RESPONSE_FIELDS = (
    "cv_filename", "target_role", "user_name", "github_url", "additional_context",
    "user_profile", "market_data", "skill_gaps", "roadmap",
    "messages", "error", "status",
)


def _build_client_response(state: dict) -> dict:
    return {key: state.get(key) for key in _CLIENT_RESPONSE_FIELDS}


@app.post("/api/analyze-stream")
async def analyze_career_stream(
    cv_file: UploadFile = File(..., description="CV dalam format PDF"),
    target_role: str = Form(..., description="Posisi yang dituju"),
    user_name: str = Form(default="", description="Nama pengguna"),
    github_url: str = Form(default="", description="URL GitHub (opsional)"),
    additional_context: str = Form(default="", description="Konteks tambahan: preferensi, minat, tujuan karier"),
    client_id: str = Form(default="", description="ID browser (localStorage), dipakai untuk fitur History"),
    extra_files: list[UploadFile] = File(default=[], description="File lampiran tambahan: PDF, DOCX, TXT"),
):
    """
    Sama seperti /api/analyze, tapi mengirim progress real-time per-agent via
    Server-Sent Events selagi LangGraph berjalan (career_graph.stream()),
    diakhiri satu event 'done' berisi payload identik dengan /api/analyze.
    """
    initial_state = await _build_initial_state(
        cv_file, target_role, user_name, github_url, additional_context, extra_files,
    )

    from graph import career_graph

    logger.info(
        "Mulai analisis (stream) '%s' — CV: %s | konteks: %d chars | lampiran: %d chars",
        target_role, cv_file.filename, len(additional_context), len(initial_state["attachments_text"]),
    )

    def run_graph(chunk_queue: queue.Queue):
        """Jalankan career_graph.stream() di thread terpisah, dorong tiap chunk ke queue."""
        try:
            for chunk in career_graph.stream(initial_state):
                chunk_queue.put(("chunk", chunk))
        except Exception as e:
            chunk_queue.put(("error", str(e)))
        finally:
            chunk_queue.put(("end", None))

    async def event_generator():
        chunk_queue: queue.Queue = queue.Queue()
        thread = threading.Thread(target=run_graph, args=(chunk_queue,), daemon=True)
        thread.start()

        accumulated_state = dict(initial_state)
        done_nodes: set[str] = set()
        loop = asyncio.get_event_loop()

        try:
            while True:
                kind, payload = await loop.run_in_executor(None, chunk_queue.get)

                if kind == "error":
                    logger.error("Graph stream error: %s", payload)
                    yield _sse_event("error", {"message": f"Terjadi kesalahan sistem: {payload}"})
                    return

                if kind == "end":
                    break

                # kind == "chunk": payload = {"<node_name>": {<partial state update>}}
                for node_name, node_output in payload.items():
                    accumulated_state.update(node_output)
                    done_nodes.add(node_name)

                    stage = _STAGE_LABELS.get(node_name, node_name)
                    group = _STAGE_GROUPS.get(node_name, {node_name})
                    stage_done = group.issubset(done_nodes)
                    messages = node_output.get("messages") or []

                    yield _sse_event("progress", {
                        "node": node_name,
                        "stage": stage,
                        "status": "done" if stage_done else "started",
                        "message": messages[-1] if messages else "",
                    })

            response = _build_client_response(accumulated_state)

            if accumulated_state.get("error"):
                logger.warning("Graph stream selesai dengan error: %s", accumulated_state["error"])
                yield _sse_event("error", {"message": accumulated_state["error"], "partial_result": response})
                return

            match_pct = accumulated_state.get("skill_gaps", {}).get("persentase_kecocokan")
            logger.info("Analisis (stream) selesai — match: %s%%", match_pct)
            yield _sse_event("done", response)

            if client_id:
                supabase_client.insert_history(
                    client_id=client_id,
                    target_role=accumulated_state.get("target_role", ""),
                    cv_filename=accumulated_state.get("cv_filename", ""),
                    match_percentage=match_pct if isinstance(match_pct, int) else None,
                    result=response,
                )

        finally:
            thread.join(timeout=1)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# History endpoints (Supabase — riwayat analisis per client_id/browser)
# ---------------------------------------------------------------------------

def _require_supabase():
    if not supabase_client.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Fitur riwayat belum dikonfigurasi di server (SUPABASE_URL/SUPABASE_SERVICE_KEY kosong).",
        )


@app.get("/api/history")
async def get_history(client_id: str):
    """List ringkas riwayat analisis milik client_id, terbaru dulu."""
    _require_supabase()
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id wajib diisi.")
    try:
        return supabase_client.list_history(client_id)
    except Exception as e:
        logger.error("Gagal mengambil riwayat: %s", e)
        raise HTTPException(status_code=500, detail=f"Gagal mengambil riwayat: {str(e)}")


@app.get("/api/history/{history_id}")
async def get_history_detail(history_id: str, client_id: str):
    """Detail satu riwayat (payload analisis lengkap) milik client_id."""
    _require_supabase()
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id wajib diisi.")
    try:
        item = supabase_client.get_history_detail(client_id, history_id)
    except Exception as e:
        logger.error("Gagal mengambil detail riwayat: %s", e)
        raise HTTPException(status_code=500, detail=f"Gagal mengambil detail riwayat: {str(e)}")
    if item is None:
        raise HTTPException(status_code=404, detail="Riwayat tidak ditemukan.")
    return item


@app.delete("/api/history/{history_id}")
async def delete_history_item(history_id: str, client_id: str):
    """Hapus satu riwayat milik client_id."""
    _require_supabase()
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id wajib diisi.")
    try:
        deleted = supabase_client.delete_history(client_id, history_id)
    except Exception as e:
        logger.error("Gagal menghapus riwayat: %s", e)
        raise HTTPException(status_code=500, detail=f"Gagal menghapus riwayat: {str(e)}")
    if not deleted:
        raise HTTPException(status_code=404, detail="Riwayat tidak ditemukan.")
    return {"deleted": True}


@app.delete("/api/history")
async def delete_all_history_items(client_id: str):
    """Hapus semua riwayat milik client_id."""
    _require_supabase()
    if not client_id:
        raise HTTPException(status_code=400, detail="client_id wajib diisi.")
    try:
        count = supabase_client.delete_all_history(client_id)
    except Exception as e:
        logger.error("Gagal menghapus semua riwayat: %s", e)
        raise HTTPException(status_code=500, detail=f"Gagal menghapus semua riwayat: {str(e)}")
    return {"deleted_count": count}


# ---------------------------------------------------------------------------
# Job search endpoint (Tavily — no LLM)
# ---------------------------------------------------------------------------

class JobSearchRequest(BaseModel):
    query: str
    limit: int = 10
    filter_city: Optional[str] = None
    filter_industry: Optional[str] = None


@app.post("/api/search-jobs")
async def search_jobs(request: JobSearchRequest):
    """
    Pencarian lowongan real-time via Tavily.
    Returns hasil dari LinkedIn/JobStreet/Glints dalam ~2-5 detik.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query tidak boleh kosong.")

    try:
        from tools.tavily_search import search_jobs_tavily
        from tools.vector_store import matches_job_filter

        has_filter = bool(request.filter_city or request.filter_industry)
        fetch_limit = min(request.limit * 2, 20) if has_filter else min(request.limit, 20)

        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            lambda: search_jobs_tavily(
                request.query,
                location="Indonesia",
                num_results=fetch_limit,
            ),
        )
        if has_filter:
            results = [
                j for j in results
                if matches_job_filter(j, request.filter_city, request.filter_industry)
            ]
        results = results[:request.limit]
        return {"results": results, "total": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Market trends endpoint (Tavily — no LLM)
# ---------------------------------------------------------------------------

class MarketTrendsRequest(BaseModel):
    categories: list[str]


@app.post("/api/market-trends")
async def market_trends(request: MarketTrendsRequest):
    """
    Data tren pasar (growth signal, salary, top companies) per kategori role.
    Dipakai oleh halaman Tren Pasar di frontend — 3 Tavily credits per kategori.
    """
    if not request.categories:
        raise HTTPException(status_code=400, detail="Categories tidak boleh kosong.")

    try:
        from tools.tavily_search import search_market_trends_by_category

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: search_market_trends_by_category(request.categories),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Run directly
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
