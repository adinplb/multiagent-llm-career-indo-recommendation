# Cerah AI — Multi-Agent Career Recommendation System

Sistem rekomendasi karier berbasis AI untuk pasar kerja Indonesia. Menggunakan arsitektur **Multi-Agent Paralel (LangGraph Fan-Out/Fan-In)** dengan FastAPI backend (progress real-time via Server-Sent Events) dan frontend React SPA dalam Bahasa Indonesia.

---

## Daftar Isi

1. [Arsitektur Multi-Agent (Paralel)](#arsitektur-multi-agent)
2. [User Journey](#user-journey)
3. [Services & Tech Stack](#services--tech-stack)
4. [Cara Menjalankan](#cara-menjalankan)
5. [Skenario Pengujian](#skenario-pengujian)
6. [Cara Mengukur Kualitas Output AI](#cara-mengukur-kualitas-output-ai)
7. [Kustomisasi Model AI](#kustomisasi-model-ai)

---

## Arsitektur Multi-Agent

### Diagram Alur (Fan-Out / Fan-In)

```
                         ┌─────────────────────────────────────────────────────┐
  PDF CV + Target Role   │              FastAPI /api/analyze                    │
  ──────────────────────►│  validates input → builds initial CareerState        │
  + Konteks Tambahan     └──────────────────────┬──────────────────────────────┘
  + File Lampiran                               │
                                      ┌─────────▼──────────┐
                                      │    COORDINATOR      │
                                      │  (validasi + routing)│
                                      │  Tidak panggil LLM  │
                                      └────┬──────────┬─────┘
                                           │ Send()   │ Send()
                                ┌──────────▼──┐   ┌───▼──────────┐
                                │   PROFILER  │   │   ANALYST    │
                                │ (paralel ←→)│   │ (paralel ←→) │
                                │ Haiku/grok  │   │ Haiku/grok   │
                                │ Analisis CV │   │ Riset pasar  │
                                │ + konteks   │   │ via Tavily   │
                                └──────────┬──┘   └───┬──────────┘
                                           │           │
                                           │  Fan-In   │
                                      ┌────▼───────────▼────┐
                                      │    GAP ANALYZER      │
                                      │  (menunggu keduanya) │
                                      │  Sonnet/grok         │
                                      │  Hitung skill gap    │
                                      └──────────┬───────────┘
                                                 │
                                      ┌──────────▼───────────┐
                                      │      STRATEGIST       │
                                      │  Sonnet/grok          │
                                      │  Roadmap 6 bulan (ID) │
                                      │  + personalisasi ctx  │
                                      └──────────┬────────────┘
                                                 │
                                      ┌──────────▼────────────┐
                                      │    CareerState JSON    │
                                      │  → React SPA (via SSE) │
                                      └───────────────────────┘
```

> `POST /api/analyze-stream` menjalankan graph yang sama via `career_graph.stream()` dan mengirim progress tiap node selesai sebagai Server-Sent Events, diakhiri satu event `done` berisi `CareerState` lengkap. `POST /api/analyze` (non-streaming, `career_graph.invoke()`) tetap tersedia untuk konsumen yang tidak butuh progress real-time.

### Penjelasan Setiap Agent

| Agent | File | LLM (default) | Provider | Berjalan | Input | Output |
|---|---|---|---|---|---|---|
| **Coordinator** | `backend/agents/coordinator.py` | — (no LLM) | — | Sequential | cv_text, target_role | validasi + routing |
| **Profiler** | `backend/agents/profiler.py` | `PROFILER_MODEL` = gemini-2.5-flash | Google Gemini | **PARALEL** | cv_text, github_url, additional_context, attachments_text | `user_profile` (JSON) |
| **Market Analyst** | `backend/agents/analyst.py` | `ANALYST_MODEL` = gemini-2.5-flash | Google Gemini | **PARALEL** | target_role | `market_data` (JSON) via Tavily |
| **Gap Analyzer** | `backend/agents/gap_analyzer.py` | `GAP_MODEL` = llama-3.3-70b-versatile | Groq | Sequential (Fan-In) | user_profile + market_data | `skill_gaps` (JSON) |
| **Strategist** | `backend/agents/strategist.py` | `STRATEGIST_MODEL` = llama-3.3-70b-versatile | Groq | Sequential | semua output + additional_context | `roadmap` (Markdown) |

### Mengapa Paralel?

**Profiler** dan **Market Analyst** berjalan **secara bersamaan** menggunakan LangGraph `Send` API:

```python
# agents/coordinator.py
def fan_out_router(state: CareerState):
    return [
        Send("profiler", state),   # thread 1: analisis CV
        Send("analyst", state),    # thread 2: riset pasar Tavily
    ]
```

- Profiler menganalisis CV pengguna (+ konteks tambahan + file lampiran) — model dikonfigurasi via `PROFILER_MODEL`
- Analyst secara bersamaan mencari data lowongan + gaji di pasar Indonesia via Tavily — model dikonfigurasi via `ANALYST_MODEL`
- Gap Analyzer baru berjalan setelah **keduanya selesai** (Fan-In otomatis oleh LangGraph)
- Total waktu = `max(waktu_profiler, waktu_analyst)` bukan jumlahnya — **~40-50% lebih cepat**

### State Bersama (LangGraph CareerState)

```python
# state.py
class CareerState(TypedDict):
    # Input
    cv_text: str
    target_role: str
    github_url: str
    additional_context: str    # Konteks tambahan dari textarea UI (preferensi, tujuan)
    attachments_text: str      # Teks dari file lampiran (PDF/DOCX/TXT), max 15.000 chars

    # Output per agent
    user_profile: dict      # dari Profiler
    market_data: dict       # dari Market Analyst (Tavily real-time)
    skill_gaps: dict        # dari Gap Analyzer
    roadmap: str            # dari Strategist

    # Aman untuk penulisan paralel (reducer)
    messages: Annotated[list, operator.add]      # append-only
    error:    Annotated[str, _last_value]         # last-write-wins
    status:   Annotated[str, _last_value]         # last-write-wins
```

Field `messages`, `error`, dan `status` menggunakan **reducer** agar kedua agent paralel bisa menulis tanpa konflik (`InvalidUpdateError`).

---

## User Journey

```
1. Buka http://localhost:8080/  (landing page)
   └─► Klik CTA "Mulai Sekarang" / "Coba Petakan Karirmu"

2. /consent — Persetujuan Penggunaan Data
   └─► "Setujui & Lanjutkan" → /analyze

3. /analyze — Isi formulir:
   ├─ Upload CV (PDF, drag & drop atau klik untuk pilih file)
   ├─ Target posisi (contoh: "Backend Engineer")
   ├─ Target Experience Level (digabung ke additional_context sebelum dikirim)
   ├─ URL GitHub (opsional — memperkaya analisis)
   └─ Additional Context (opsional — textarea preferensi karier, minat, batasan)
        Contoh: "Saya ingin transisi ke ML, prefer remote, tertarik fintech startup"

   Klik "Initialize Analysis"
   └─► Form disembunyikan, panel "AI Agents Processing" tampil di halaman yang sama
   └─► Browser membuka koneksi SSE ke POST /api/analyze-stream (fetch + ReadableStream)

4. Pipeline berjalan (~15-30 detik), progress tiap tahap tampil real-time:
   ├─ Validasi Input (Coordinator)
   ├─ [PARALEL] Profiler & Market Analyst — ekstrak skill dari CV, riset pasar via Tavily
   ├─ Gap Analyzer — hitung persentase kecocokan + skill yang kurang
   └─ Strategist — susun roadmap 6 bulan, dipersonalisasi dengan konteks pengguna

   Terminal log menampilkan pesan tiap tahap; jika terjadi error (mis. CV tidak
   bisa diekstrak), event `error` diterima dan pesan ditampilkan dengan tombol "Coba Lagi".

5. Saat event `done` diterima: hasil disimpan ke `sessionStorage`, browser
   dialihkan ke /result menampilkan:
   ├─ Match Score (gauge) + Salary Benchmark (min/median/max)
   ├─ Skill Radar (SVG, dihitung dari keahlian_dimiliki vs keahlian_kurang)
   ├─ SKKNI Category Mapping
   ├─ Roadmap karier 6 bulan (parsed dari Markdown, sanitized sebelum di-render)
   ├─ Rekomendasi bootcamp Indonesia
   └─ Lowongan relevan dari Tavily (LinkedIn, JobStreet, Glints) + link langsung

   Refresh langsung ke /result tanpa data tersimpan akan redirect balik ke /analyze.
```

---

## Services & Tech Stack

### Layanan

| Layanan | URL | Keterangan |
|---|---|---|
| Frontend (React SPA) | `http://localhost:8080` | Landing, consent, analyze, result — UI Bahasa Indonesia |
| FastAPI Backend | `http://localhost:8000` | REST API + SSE, endpoint analisis |
| API Docs (Swagger) | `http://localhost:8000/docs` | Dokumentasi interaktif |

### Tech Stack

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Orchestrasi Agent** | LangGraph 0.2+ | Fan-Out/Fan-In paralel dengan Send API |
| **LLM Framework** | LangChain 0.2+ | Abstraksi model, prompt management |
| **LLM Provider (Profiler, Analyst)** | Google Gemini | Endpoint OpenAI-compatible, free tier langsung dari Google |
| **LLM Provider (Gap Analyzer, Strategist)** | Groq | Endpoint OpenAI-compatible, inference sangat cepat, free tier |
| **Model Paralel (Profiler)** | gemini-2.5-flash | Ekstraksi CV |
| **Model Paralel (Analyst)** | gemini-2.5-flash | Agregasi data pasar |
| **Model Sequential (Gap)** | llama-3.3-70b-versatile | Reasoning skill gap |
| **Model Sequential (Strategist)** | llama-3.3-70b-versatile | Roadmap 6 bulan |
| **Job Search Real-Time** | Tavily Search API | LinkedIn, JobStreet, Glints — 1.000 req/bulan gratis |
| **Semantic Search** | FAISS IndexFlatIP + Hugging Face Inference API | `Qwen/Qwen3-Embedding-0.6B`; fallback TF-IDF |
| **Bootcamp Info** | Tavily Search API | Dicoding, Bangkit, Hacktiv8, Binar, RevoU — real-time |
| **Salary Data** | Tavily + gajimu.com | Range gaji IDR dari pencarian real-time + fallback table |
| **PDF Parser** | PyMuPDF (fitz) | Ekstrak teks dari CV PDF + file lampiran |
| **DOCX Parser** | python-docx | Ekstrak teks dari file Word (.docx) |
| **Backend API** | FastAPI + Uvicorn | Async, multipart form dengan file lampiran, SSE streaming |
| **Frontend** | React 18 + Vite + React Router | SPA, Tailwind CSS (build-time, bukan CDN) |
| **Visualisasi** | SVG native (gauge, radar chart) | Dihitung langsung dari data (trigonometri), tanpa library chart |
| **Markdown Rendering** | marked + DOMPurify | Roadmap karier di-parse & disanitasi sebelum di-render sebagai HTML |

### Struktur Folder

`backend/` dan `frontend/app/` berisi murni kode aplikasi — konfigurasi (`.env`, `docker-compose.yml`)
ada di root project, sejajar dengan `README.md` dan `.gitignore`.

```
multiagent-llm-career-indo-recommendation/
├── .env                          # Kredensial asli (gitignored) — Tavily, Gemini, Groq, Supabase, VITE_BACKEND_URL
├── .env.example                   # Template, aman di-commit
├── docker-compose.yml              # 2 service: backend, frontend
├── .gitignore
├── README.md
│
├── backend/                     # FastAPI + LangGraph multi-agent pipeline (kode murni)
│   ├── main.py                    # Entry point: /api/analyze, /api/analyze-stream (SSE), dll
│   ├── graph.py                    # LangGraph graph: wiring semua agent
│   ├── state.py                     # CareerState TypedDict (shared state)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── agents/
│   │   ├── llm_factory.py           # Pemilihan LLM terpusat (Google Gemini + Groq)
│   │   ├── coordinator.py           # Validasi + Fan-Out router
│   │   ├── profiler.py              # Analisis CV + konteks tambahan → user_profile
│   │   ├── analyst.py               # Riset pasar via Tavily → market_data
│   │   ├── gap_analyzer.py          # Fan-In → skill_gaps
│   │   └── strategist.py            # Roadmap 6 bulan + personalisasi → roadmap
│   └── tools/
│       ├── cv_parser.py             # PDF → teks, GitHub scraper
│       ├── tavily_search.py         # Semua Tavily calls terpusat
│       ├── vector_store.py          # FAISS + HF Inference API embeddings (fallback TF-IDF)
│       ├── job_scraper.py           # Delegasi ke tavily_search (gaji, tren, perusahaan)
│       └── supabase_client.py       # Riwayat analisis (fitur History), opsional
│
├── frontend/
│   └── app/                     # React SPA (Vite) — 7 halaman dashboard + landing (kode murni)
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── Dockerfile                 # Multi-stage: node build → nginx serve
│       ├── nginx.conf                  # SPA fallback (try_files → index.html)
│       └── src/
│           ├── main.jsx, App.jsx (React Router routes), index.css
│           ├── lib/                       # api.js, format.js, roadmap.js, clientId.js
│           ├── hooks/                      # useAnalysisStream.js (SSE client)
│           ├── pages/                       # Landing, Consent, Analyze, Result, Overview, History, Settings
│           └── components/
│               ├── landing/                  # Hero, Stats, Features, AgentLab, Pricing, Faq, dll
│               ├── analyze/                   # CvDropzone, TargetPositionForm, ProcessingPanel, dll
                    ├── result/                     # MatchGauge, SalaryBenchmark, SkillRadar, RoadmapTimeline, dll
                    ├── overview/                    # EducationCard, WebinarList, ModuleRecommendations
                    └── dashboard/                    # DashboardSidebar (nav bersama semua halaman dashboard)
```

---

## Cara Menjalankan

> Sistem ini menggunakan data **real-time** dari Tavily (LinkedIn, JobStreet, Glints) — tidak ada dataset lokal. Pastikan komputer terhubung ke internet dan `TAVILY_API_KEY` diset di `.env`.

### Git Hooks dan Pemeriksaan Pre-commit

Repository ini menggunakan [pre-commit](https://pre-commit.com/) dan hook dari
[`pre-commit-hooks`](https://github.com/pre-commit/pre-commit-hooks) untuk memeriksa file yang di-stage sebelum commit.
Setup ini memerlukan Python, GNU Make, dan Git.

```bash
pip install pre-commit
make git-hooks
```

`.pre-commit-config.yaml` mengaktifkan pemeriksaan sintaks Python, JSON, YAML, TOML,
konflik merge, debug statement Python, spasi akhir, newline di akhir file, serta file besar
yang ditambahkan. Hook lokal `python-compileall` mempertahankan pemeriksaan sintaks Python
repository melalui `make lint`.

Untuk menjalankan seluruh pemeriksaan secara manual:

```bash
pre-commit run --all-files
```

Jika hook memperbaiki format file, tinjau perubahan lalu stage ulang sebelum commit.

### Continuous Integration

GitHub Actions menjalankan pemeriksaan saat ada push atau pull request ke `master`,
serta dapat dijalankan manual dari tab **Actions**. Workflow `.github/workflows/ci.yml`
menjalankan seluruh hook pre-commit dan build production frontend (`npm ci` lalu
`npm run build`) tanpa memerlukan API key aplikasi.

Saat ini workflow belum melakukan deployment: Docker Compose hanya mendefinisikan
cara menjalankan aplikasi secara lokal. Untuk menambahkan deployment, tentukan target
hosting dan strategi rilis terlebih dahulu; workflow kemudian dapat dikonfigurasi dengan
kredensial deployment sebagai GitHub Actions secrets.

### Setup Supabase (Fitur History) — Opsional

Fitur "History" (riwayat analisis karier) menyimpan hasil analisis ke [Supabase](https://supabase.com)
(PostgreSQL, free tier). **Tanpa langkah ini, aplikasi tetap berjalan normal** — endpoint `/api/history`
akan merespons HTTP 503 dan halaman `/history` menampilkan pesan bahwa fitur belum dikonfigurasi.

1. Buat akun & project baru (gratis) di https://supabase.com.
2. Buka **SQL Editor** di dashboard Supabase, jalankan skema tabel berikut:
   ```sql
   create table analysis_history (
     id uuid primary key default gen_random_uuid(),
     client_id uuid not null,
     target_role text not null,
     cv_filename text,
     match_percentage integer,
     result jsonb not null,
     created_at timestamptz not null default now()
   );
   create index idx_analysis_history_client_id on analysis_history(client_id);
   ```
3. Buka **Project Settings → API**, salin dua nilai berikut ke `.env` (di root project):
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGci...   # pakai "service_role" secret key, BUKAN anon/public key
   ```

`SUPABASE_SERVICE_KEY` hanya pernah dipakai dari backend (`backend/tools/supabase_client.py`) —
tidak pernah dikirim ke browser. Identitas "pemilik" riwayat memakai `client_id`, sebuah UUID yang
di-generate sekali per-browser (`localStorage`, lihat `frontend/app/src/lib/clientId.js`) — ini
**bukan sistem akun/autentikasi sungguhan**, hanya cukup untuk memisahkan riwayat antar-browser.
Saat kuota free tier (500MB) mendekati penuh, hapus row lewat tombol "Hapus Semua Riwayat" /
"Hapus" per-item di halaman `/history`, atau langsung lewat Table Editor Supabase.

### Opsi A — Jalankan via Docker Desktop (Direkomendasikan)

**Langkah 1 — Clone Repository**
```bash
git clone https://github.com/adinplb/multiagent-llm-career-indo-recommendation.git
cd multiagent-llm-career-indo-recommendation
```

**Langkah 2 — Konfigurasi API Key**

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Edit `.env` (di root project) dan isi minimal:
```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY=xxxxxxxxxxxxxxxx       # https://aistudio.google.com/apikey — free tier
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx     # https://console.groq.com/keys — free tier
HF_API_TOKEN=hf_xxxxxxxxxxxxxxxx      # https://huggingface.co/settings/tokens — free, tipe "Read"
```
Model per-agent (`PROFILER_MODEL`, `ANALYST_MODEL` — Gemini; `GAP_MODEL`, `STRATEGIST_MODEL` — Groq)
sudah ada default di file template — ubah sesuai kebutuhan. Lihat daftar model Gemini di
https://ai.google.dev/gemini-api/docs/models dan Groq di https://console.groq.com/docs/models.

Embedding (`EMBEDDING_MODEL`, default `Qwen/Qwen3-Embedding-0.6B`) dipanggil via **Hugging Face
Inference API** — butuh `HF_API_TOKEN`, tidak ada model yang di-download/jalan di container.

Semua konfigurasi (backend + frontend) kini berasal dari **satu file** `.env` di root — tidak ada lagi `.env` terpisah di `backend/` atau `frontend/app/`. `VITE_BACKEND_URL` di `.env` dipakai frontend saat build (lihat `frontend/app/src/lib/api.js`), sesuai dengan port yang di-expose backend di `docker-compose.yml`.

**Langkah 3 — Build & Jalankan**

Pastikan **Docker Desktop** sudah berjalan, lalu dari root project:
```bash
docker compose up --build
```

**Langkah 4 — Akses Aplikasi**

| Layanan | URL |
|---|---|
| Frontend (landing → consent → analyze → result) | http://localhost:8080 |
| Backend API docs | http://localhost:8000/docs |

Verifikasi backend hidup:
```bash
curl http://localhost:8000/api/health
```
```json
{
  "status": "ok",
  "mode": "realtime",
  "job_sources": ["Tavily"],
  "search_backend": "Tavily + FAISS embeddings",
  "llm_providers": {
    "profiler": "Google Gemini",
    "analyst": "Google Gemini",
    "gap_analyzer": "Groq",
    "strategist": "Groq"
  },
  "llm_models": {
    "profiler": "gemini-2.5-flash",
    "analyst": "gemini-2.5-flash",
    "gap_analyzer": "llama-3.3-70b-versatile",
    "strategist": "llama-3.3-70b-versatile"
  },
  "tavily_configured": true
}
```

**Menghentikan:**
```bash
docker compose down
```

### Opsi B — Jalankan Manual (Tanpa Docker)

Konfigurasi `.env` di root (lihat Langkah 2 di Opsi A di atas) dipakai bersama — pastikan sudah diisi
sebelum menjalankan manual.

**Backend** (Terminal 1):
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
`main.py` otomatis membaca `../.env` (root project) relatif terhadap lokasinya sendiri — tidak perlu
menyalin `.env` ke folder `backend/`.

**Frontend** (Terminal 2, baru — jangan tutup Terminal 1):
```bash
cd frontend/app
npm install
```
Vite **butuh file `.env` miliknya sendiri** di `frontend/app/` (batasan teknis Vite — tidak bisa
membaca env dari folder lain). Salin manual sekali:
```bash
# Windows
echo VITE_BACKEND_URL=http://localhost:8000 > .env
# Mac/Linux
echo "VITE_BACKEND_URL=http://localhost:8000" > .env
```
```bash
npm run dev
```

Buka browser dan akses: **`http://localhost:5173`**

Untuk build production lokal (tanpa Docker):
```bash
cd frontend/app
npm run build      # menghasilkan frontend/app/dist/
npm run preview    # serve hasil build untuk pengecekan cepat
```

### Uji Pipeline Lengkap via Terminal (Opsional)

Tanpa membuka browser, uji end-to-end via `curl`:

```bash
# Analisis CV dasar
curl -X POST http://localhost:8000/api/analyze \
  -F "cv_file=@cv_saya.pdf" \
  -F "target_role=Backend Engineer" \
  -F "user_name=Budi Santoso"
```

Dengan konteks tambahan dan file lampiran:
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "cv_file=@cv_saya.pdf" \
  -F "target_role=ML Engineer" \
  -F "user_name=Budi Santoso" \
  -F "additional_context=Saya ingin transisi ke ML, prefer remote, tertarik startup fintech" \
  -F "extra_files=@transkrip.pdf" \
  -F "extra_files=@sertifikat.docx"
```

Pencarian lowongan real-time via Tavily:
```bash
curl -X POST http://localhost:8000/api/search-jobs \
  -H "Content-Type: application/json" \
  -d '{"query": "data scientist Jakarta", "limit": 5}'
```

### Langkah 8 — Mematikan Services

**Cara normal** — tekan `Ctrl+C` di masing-masing terminal:
- Terminal 1 (backend): `Ctrl+C`
- Terminal 2 (frontend): `Ctrl+C`

**Force kill semua sekaligus** (jika terminal tidak responsif):

**Windows:**
```bash
taskkill /F /IM python.exe
```

**Mac / Linux:**
```bash
pkill -f "uvicorn|vite"
```

**Verifikasi sudah berhenti:**
```bash
# Windows (PowerShell)
curl.exe http://localhost:8000/api/health   # → connection refused = berhasil stop
curl.exe http://localhost:5173              # → connection refused = berhasil stop

# Mac / Linux
curl http://localhost:8000/api/health
curl http://localhost:5173
```

---

### Ringkasan Perintah Terminal (mode manual, tanpa Docker)

| Langkah | Perintah | Terminal |
|---|---|---|
| Clone & masuk folder | `git clone ... && cd ...` | Mana saja |
| Salin `.env` & isi API key | `copy .env.example .env` lalu edit `TAVILY_API_KEY` + `GOOGLE_API_KEY` + `GROQ_API_KEY` | Mana saja |
| **Backend** — venv | `cd backend && python -m venv venv && venv\Scripts\activate` | Terminal 1 |
| Install packages | `pip install -r requirements.txt` | Terminal 1 |
| Jalankan backend | `uvicorn main:app --reload --port 8000` | Terminal 1 |
| **Frontend** — install | `cd frontend/app && npm install` | Terminal 2 |
| Salin env frontend | `echo VITE_BACKEND_URL=http://localhost:8000 > .env` | Terminal 2 |
| Jalankan frontend (dev) | `npm run dev` | Terminal 2 |
| Cek health backend | `curl http://localhost:8000/api/health` | Terminal mana saja |
| Buka UI | Buka browser → `http://localhost:5173` | Browser |
| **Stop backend** | `Ctrl+C` | Terminal 1 |
| **Stop frontend** | `Ctrl+C` | Terminal 2 |
| **Force kill semua (Windows)** | `taskkill /F /IM python.exe` lalu `taskkill /F /IM node.exe` | Terminal mana saja |
| **Force kill semua (Mac/Linux)** | `pkill -f "uvicorn\|vite"` | Terminal mana saja |

---

## Skenario Pengujian

### Skenario 1: Happy Path (CV Normal)

**Input:**
- CV PDF developer dengan 2-3 tahun pengalaman
- Target role: `"Backend Engineer"`

**Ekspektasi:**
- `user_profile.keahlian_teknis` berisi minimal 5 skill
- `market_data.tren_pertumbuhan` = `"high"` atau `"medium"`
- `skill_gaps.persentase_kecocokan` antara 20-80%
- `roadmap` berisi section Bulan 1-2, 3-4, 5-6 dalam Bahasa Indonesia
- `market_data.pekerjaan_lokal` berisi lowongan dengan URL valid dari Tavily

**Cara uji via API:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "cv_file=@cv_saya.pdf" \
  -F "target_role=Backend Engineer" \
  -F "user_name=Budi Santoso"
```

---

### Skenario 2: CV Kosong / PDF Rusak

**Input:** File PDF kosong atau bukan PDF

**Ekspektasi:**
- HTTP 400: `"Hanya file PDF yang diterima."` (bukan PDF)
- HTTP 422: `"Tidak dapat mengekstrak teks dari PDF."` (PDF scan/gambar)
- Pipeline **tidak** dijalankan sama sekali

---

### Skenario 3: Paralel Agent Berhasil

**Cara verifikasi:** Cek log Uvicorn saat analisis berjalan. Harus muncul log dari Profiler dan Analyst **secara berselang-seling** (bukan berurutan):

```
INFO  Profiler: memulai ekstraksi keahlian dari CV...
INFO  Market Analyst: menganalisis pasar untuk 'Backend Engineer'...
INFO  Profiler: ekstraksi selesai — 8 keahlian teknis ditemukan
INFO  Market Analyst: analisis selesai — tren=high
INFO  Gap Analyzer: menghitung kesenjangan keahlian...
```

Jika Profiler selalu selesai **sebelum** Analyst mulai, paralel tidak berjalan.

---

### Skenario 4: Konteks Tambahan + File Lampiran

**Input:**
- CV PDF developer
- `additional_context`: "Saya ingin transisi dari backend ke ML Engineering, prefer remote work, tertarik startup fintech"
- File lampiran: transkrip nilai (PDF), sertifikat (DOCX)

**Ekspektasi:**
- `roadmap` menyebutkan ML Engineering dan menyesuaikan saran bootcamp
- Roadmap mencantumkan rekomendasi yang relevan dengan fintech/remote
- `user_profile` mencerminkan skill dari transkrip/sertifikat (jika ada)

**Cara uji via API:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "cv_file=@cv.pdf" \
  -F "target_role=ML Engineer" \
  -F "additional_context=Ingin transisi ke ML, prefer remote, suka startup fintech" \
  -F "extra_files=@transkrip.pdf"
```

---

### Skenario 5: Tanpa Koneksi Internet

**Input:** Matikan internet saat analisis

**Ekspektasi:**
- Tavily search gagal → `tavily_search.py` mengembalikan `[]` (graceful fallback)
- Salary data menggunakan **fallback range** berbasis role (hardcoded IDR table di `tavily_search.py`)
- FAISS tidak dibangun (tidak ada data) → `search_similar_jobs` mengembalikan list kosong
- Pipeline tetap selesai dengan data minimal
- Tidak ada crash; ada pesan error di `messages`

---

### Skenario 6: Pencarian Lowongan Real-Time (Tanpa LLM)

```bash
curl -X POST http://localhost:8000/api/search-jobs \
  -H "Content-Type: application/json" \
  -d '{"query": "data scientist machine learning Jakarta", "limit": 5}'
```

**Ekspektasi:** Respons berisi lowongan dari Tavily (LinkedIn/JobStreet/Glints), `total` > 0. Waktu respons ~2-5 detik. Setiap lowongan memiliki field `link` dengan URL valid.

---

### Skenario 7: GitHub URL Disertakan

**Input:** URL GitHub valid (contoh: `https://github.com/username`)

**Ekspektasi:**
- `user_profile.github_languages` berisi bahasa dari repo GitHub
- Bahasa tersebut juga masuk ke `user_profile.keahlian_teknis`

---

## Cara Mengukur Kualitas Output AI

### 1. Persentase Kecocokan (`persentase_kecocokan`)

Nilai 0-100 dari Gap Analyzer. Panduan interpretasi:

| Range | Interpretasi |
|---|---|
| 0-30% | CV sangat tidak sesuai role target — perlu banyak persiapan |
| 31-55% | Sebagian skill sudah ada — perlu 3-6 bulan pengembangan |
| 56-75% | Cukup siap — gap spesifik yang bisa diisi dalam 1-3 bulan |
| 76-100% | Sangat cocok — bisa langsung melamar |

**Cara validasi manual:** Bandingkan `keahlian_teknis` di profil dengan `keterampilan_diminati` dari market data. Hitung overlap secara manual dan bandingkan dengan nilai yang diberikan AI. Selisih >15% berarti prompt perlu di-tune.

### 2. Kualitas Ekstraksi Skill (Profiler)

Cek `user_profile` dari respons:

```json
{
  "keahlian_teknis": ["PHP", "Laravel", "MySQL"],        // skill eksplisit di CV
  "keahlian_tersembunyi": ["REST API Design", "ORM"],    // skill tersirat — kualitas utama
  "skkni_kategori": ["Rekayasa Perangkat Lunak"]
}
```

**Indikator kualitas:**
- `keahlian_tersembunyi` tidak boleh kosong — jika kosong, Profiler gagal menarik inferensi
- `skkni_kategori` harus relevan dengan isi CV
- `pengalaman_tahun` harus masuk akal (cek dengan CV asli)
- Jika `additional_context` diisi, `keahlian_tersembunyi` harus mencerminkan preferensi tersebut

### 3. Kualitas Roadmap (Strategist)

Checklist manual:
- [ ] Ada section Bulan 1-2, 3-4, 5-6
- [ ] Menyebut platform Indonesia (Dicoding, Digitalent Kominfo, BNSP, Bangkit, dll)
- [ ] Skill yang disarankan sesuai dengan `keahlian_kurang` dari Gap Analyzer
- [ ] Gaji yang disebutkan realistis untuk pasar Indonesia (IDR)
- [ ] Bahasa Indonesia semi-formal dan mudah dipahami
- [ ] Jika ada `additional_context`, roadmap harus menyesuaikan (contoh: menyebut remote work, fintech, dll)

### 4. Kualitas Data Pasar (Analyst)

```json
{
  "tren_pertumbuhan": "high",
  "rata_rata_gaji": {"min_idr": 10000000, "median_idr": 18000000, "max_idr": 35000000},
  "keterampilan_diminati": ["Java", "Spring Boot", "Kubernetes"],
  "pekerjaan_lokal": [{"title": "...", "company": "...", "link": "https://..."}]
}
```

**Validasi:**
- Cek `rata_rata_gaji` dengan `gajimu.com` atau `glassdoor.com/id` secara manual
- `tren_pertumbuhan` harus konsisten dengan kondisi pasar nyata (misal: Data Scientist = high)
- `lokasi_terbaik` harus mengandung Jakarta untuk sebagian besar role teknologi
- `pekerjaan_lokal[].link` harus berupa URL valid yang bisa dibuka di browser

### 5. Relevansi Semantic Search (FAISS)

Cek `match_score` pada setiap lowongan di `market_data.pekerjaan_lokal`:
- Score > 0.7: sangat relevan
- Score 0.5-0.7: cukup relevan
- Score < 0.5: mungkin kurang relevan

Jika semua score = 0.8 (nilai default), berarti FAISS fallback ke nilai statis — kemungkinan embedding gagal.

---

## Kustomisasi Model AI

Semua parameter AI dikontrol dari file `.env` — **tidak perlu mengubah kode**.

### File: `.env`

```env
# ─── Tavily Search ───────────────────────────────────────────
# WAJIB untuk data real-time. Free tier: 1.000 req/bulan
# Budget per analisis: ~4 credits (jobs + salary + trends + bootcamp)
TAVILY_API_KEY=tvly-...

# ─── Google Gemini — Profiler + Analyst (paralel) ───────────
# Daftar gratis di https://aistudio.google.com/apikey
GOOGLE_API_KEY=...
GOOGLE_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

PROFILER_MODEL=gemini-2.5-flash
ANALYST_MODEL=gemini-2.5-flash

# ─── Groq — Gap Analyzer + Strategist (sequential) ──────────
# Daftar gratis di https://console.groq.com/keys
# Lihat model tersedia di https://console.groq.com/docs/models
GROQ_API_KEY=gsk_...
GROQ_BASE_URL=https://api.groq.com/openai/v1

GAP_MODEL=llama-3.3-70b-versatile
STRATEGIST_MODEL=llama-3.3-70b-versatile

# ─── Token & Temperature ────────────────────────────────────

# Jumlah token output maksimum (lebih tinggi = output lebih panjang)
# Default: 1200. Range rekomendasi: 800-2000
AI_MAX_TOKENS=1200

# Kreativitas output untuk agent ekstraksi data (Profiler, Analyst, Gap Analyzer)
# 0.0 = deterministik, 1.0 = sangat kreatif
# Default: 0.35. Untuk output JSON konsisten, gunakan 0.1-0.2
AI_TEMPERATURE=0.35

# Kreativitas output untuk Strategist (roadmap — lebih naratif)
# Default: 0.3. Range rekomendasi: 0.3-0.6
AI_RECOMMENDATION_TEMPERATURE=0.3

# ─── Embedding Model — Hugging Face Inference API ────────────
# Daftar token gratis (tipe "Read" sudah cukup): https://huggingface.co/settings/tokens
HF_API_TOKEN=hf_...
EMBEDDING_MODEL=Qwen/Qwen3-Embedding-0.6B
```

### Panduan Tuning

| Masalah | Solusi |
|---|---|
| Output JSON sering tidak valid | Turunkan `AI_TEMPERATURE` ke `0.05-0.1` |
| Roadmap terasa terlalu kaku/template | Naikkan `AI_RECOMMENDATION_TEMPERATURE` ke `0.5-0.7` |
| Analisis terlalu singkat | Naikkan `AI_MAX_TOKENS` ke `2000-4096` |
| Profiler/Analyst timeout atau error 429/504 | Cek kuota free tier Gemini (rate limit per menit) di aistudio.google.com; tunggu sebentar atau upgrade |
| Gap Analyzer/Strategist timeout atau error 429/504 | Cek kuota free tier Groq di console.groq.com/settings/limits |
| Skill yang diekstrak terlalu sedikit | Coba model Gemini yang lebih besar (mis. `gemini-2.5-pro` jika tersedia di akun Anda) |
| Persentase kecocokan selalu 50% | Cek apakah `keterampilan_diminati` di market_data terisi |
| Gaji tidak realistis | Cek fallback table di `backend/tools/tavily_search.py` fungsi `search_salary_tavily()` |
| Lowongan tidak relevan secara semantik | Cek `HF_API_TOKEN` valid; cek `docker logs` backend untuk error HF Inference API (401/404/cold-start timeout) — akan fallback diam-diam ke TF-IDF jika gagal |
| Konteks tambahan tidak tercermin di roadmap | Pastikan `additional_context` dikirim di form; cek log Strategist |
| Tavily habis kuota | Cek penggunaan di dashboard tavily.com; kuota gratis reset bulanan |

### Kustomisasi System Prompt

Untuk mengubah perilaku agent, edit `SYSTEM_PROMPT` di masing-masing file agent:

| Agent | File | Prompt yang bisa diubah |
|---|---|---|
| Profiler | [backend/agents/profiler.py](backend/agents/profiler.py) | Format JSON output, kategori SKKNI, instruksi baca konteks |
| Analyst | [backend/agents/analyst.py](backend/agents/analyst.py) | Kota fokus, perusahaan referensi Indonesia |
| Gap Analyzer | [backend/agents/gap_analyzer.py](backend/agents/gap_analyzer.py) | Threshold penilaian, sertifikasi |
| Strategist | [backend/agents/strategist.py](backend/agents/strategist.py) | Platform belajar, format roadmap, instruksi personalisasi |

### Menambah Platform Belajar Baru ke Roadmap
Pada bagian ini, sebabaiknya dihapus saja fiturnya.


Edit `backend/agents/strategist.py`, bagian `SYSTEM_PROMPT`, tambahkan platform baru di sekitar baris referensi platform Indonesia.

### Menambah/Mengubah Tahap Progress di Halaman Analyze

Label 4 tahap ("Validasi Input", "Profiler & Market Analyst", dst) dan pemetaannya ke node LangGraph didefinisikan di dua tempat yang harus tetap sinkron: `_STAGE_LABELS`/`_STAGE_GROUPS` di `backend/main.py` (endpoint `/api/analyze-stream`) dan `STAGES` di `frontend/app/src/hooks/useAnalysisStream.js`.

---

## Endpoint API

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/health` | Status server + konfigurasi Tavily |
| `POST` | `/api/analyze` | Analisis CV lengkap, sinkron (multipart/form-data) — dipertahankan untuk konsumen yang tidak butuh progress real-time |
| `POST` | `/api/analyze-stream` | Sama seperti `/api/analyze`, tapi mengirim progress per-agent via Server-Sent Events; **dipakai oleh frontend React** di halaman `/analyze`. Menerima field tambahan `client_id` — jika diisi dan Supabase dikonfigurasi, hasil disimpan otomatis ke riwayat |
| `GET` | `/api/history?client_id=...` | List ringkas riwayat analisis milik `client_id` (butuh Supabase, lihat [Setup Supabase](#setup-supabase-fitur-history--opsional)) |
| `GET` | `/api/history/{id}?client_id=...` | Detail satu riwayat (payload analisis lengkap) |
| `DELETE` | `/api/history/{id}?client_id=...` | Hapus satu riwayat |
| `DELETE` | `/api/history?client_id=...` | Hapus semua riwayat milik `client_id` |
| `POST` | `/api/search-jobs` | Pencarian lowongan real-time via Tavily (JSON body, dukung `filter_city`/`filter_industry`) — belum dikonsumsi frontend saat ini |
| `POST` | `/api/market-trends` | Data tren pasar per kategori role (JSON body: `{"categories": [...]}`) — belum dikonsumsi frontend saat ini |

### Contoh Request `/api/analyze`

```bash
# Dasar
curl -X POST http://localhost:8000/api/analyze \
  -F "cv_file=@cv.pdf" \
  -F "target_role=Data Scientist" \
  -F "user_name=Siti Rahayu" \
  -F "github_url=https://github.com/sitidev"

# Dengan konteks tambahan + lampiran
curl -X POST http://localhost:8000/api/analyze \
  -F "cv_file=@cv.pdf" \
  -F "target_role=ML Engineer" \
  -F "user_name=Siti Rahayu" \
  -F "additional_context=Ingin pindah ke ML, prefer remote, tertarik NLP" \
  -F "extra_files=@sertifikat_tensorflow.pdf"
```

### Contoh Response

```json
{
  "user_profile": {
    "nama": "Siti Rahayu",
    "pengalaman_tahun": 2,
    "keahlian_teknis": ["Python", "Pandas", "SQL", "Tableau"],
    "keahlian_tersembunyi": ["Data Wrangling", "ETL Pipeline", "Business Intelligence"],
    "skkni_kategori": ["Analisis Data dan Kecerdasan Buatan"]
  },
  "market_data": {
    "tren_pertumbuhan": "high",
    "rata_rata_gaji": {"min_idr": 12000000, "median_idr": 22000000, "max_idr": 40000000},
    "keterampilan_diminati": ["Python", "Machine Learning", "Spark", "TensorFlow"],
    "lokasi_terbaik": ["Jakarta", "Bandung"],
    "pekerjaan_lokal": [
      {"title": "Data Scientist", "company": "Gojek", "city": "Jakarta",
       "link": "https://linkedin.com/jobs/...", "match_score": 0.87}
    ],
    "bootcamp_info": [
      {"title": "Machine Learning Path", "platform": "Dicoding", "link": "https://dicoding.com/..."}
    ]
  },
  "skill_gaps": {
    "persentase_kecocokan": 45,
    "keahlian_kurang": ["Machine Learning", "Spark", "TensorFlow"],
    "keahlian_prioritas": ["Machine Learning", "Scikit-learn", "Deep Learning"],
    "estimasi_waktu_siap": "4-6 bulan"
  },
  "roadmap": "## Ringkasan Target\nData Scientist di Jakarta...\n\n## Bulan 1-2: Fondasi..."
}
```
