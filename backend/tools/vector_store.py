"""
Vector Store Tool — Real-time Job Search dengan FAISS Semantic Embeddings.

Arsitektur:
1. Tavily search → ambil lowongan real-time dari LinkedIn/JobStreet/Glints
2. Hugging Face Inference API (Qwen3-Embedding-0.6B) → embed job snippets
3. FAISS IndexFlatIP → semantic similarity search in-memory
4. Fallback: TF-IDF cosine similarity jika FAISS/embedding gagal

Tidak ada dataset lokal, tidak ada persistence — fresh per session.
Public signatures identik dengan versi lama (backward compatible).
"""
import os
import logging
import numpy as np
import requests
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)

HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "Qwen/Qwen3-Embedding-0.6B")
HF_API_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"


# ---------------------------------------------------------------------------
# Compatibility shim
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_sbert_model(model_name: str = "faiss"):
    """Compatibility alias — returns None (FAISS tidak butuh model object terpisah)."""
    return None


def get_or_build_job_collection(
    dataset_path=None,
    onet_path=None,
    model_name: str = "faiss",
):
    """
    Compatibility shim untuk main.py lifespan.
    Mode real-time — tidak ada dataset lokal.
    Mengembalikan empty collection dict.
    Pencarian sebenarnya dilakukan on-demand via search_similar_jobs().
    """
    logger.info("Mode real-time aktif (Tavily + FAISS) — tidak ada dataset lokal.")
    return {
        "mode": "realtime",
        "index": None,
        "vectorizer": None,
        "matrix": None,
        "metadatas": [],
        "documents": [],
    }


# ---------------------------------------------------------------------------
# Embedding layer
# ---------------------------------------------------------------------------

def _hf_embed_request(texts: list[str]) -> np.ndarray:
    """
    Panggil Hugging Face Inference API untuk embed teks.
    wait_for_model=True: tunggu model selesai cold-start alih-alih langsung 503.
    Raises Exception jika gagal → caller fall back ke TF-IDF.
    """
    if not HF_API_TOKEN:
        raise EnvironmentError(
            "HF_API_TOKEN tidak ditemukan. Set env var di .env "
            "(daftar gratis di https://huggingface.co/settings/tokens)."
        )
    response = requests.post(
        HF_API_URL,
        headers={"Authorization": f"Bearer {HF_API_TOKEN}"},
        json={"inputs": texts, "options": {"wait_for_model": True}},
        timeout=30,
    )
    response.raise_for_status()
    return np.array(response.json(), dtype=np.float32)


def _embed_with_openai(texts: list[str]) -> np.ndarray:
    """
    Embed teks via Hugging Face Inference API.
    Nama fungsi dipertahankan agar caller (build_faiss_index) tidak perlu diubah.
    """
    return _hf_embed_request(texts)


def _embed_query_openai(query: str) -> np.ndarray:
    """Embed single query string via Hugging Face Inference API."""
    return _hf_embed_request([query])


def _tfidf_scores(docs: list[str], query: str) -> np.ndarray:
    """
    TF-IDF cosine similarity fallback.
    Returns score array aligned with docs list.
    """
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    if not docs:
        return np.array([])

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words="english")
    try:
        matrix = vectorizer.fit_transform(docs)
        query_vec = vectorizer.transform([query])
        scores = cosine_similarity(query_vec, matrix).flatten()
        return scores
    except Exception:
        return np.zeros(len(docs))


# ---------------------------------------------------------------------------
# FAISS index builder
# ---------------------------------------------------------------------------

def build_faiss_index(job_docs: list[str], job_metas: list[dict]) -> dict:
    """
    Bangun FAISS IndexFlatIP in-memory dari job snippets.
    Gunakan inner product (cosine similarity setelah L2 normalization).

    Returns dict dengan keys:
      mode, index (faiss), metadatas, documents — atau TF-IDF shim jika gagal.
    """
    if not job_docs:
        return get_or_build_job_collection()

    try:
        import faiss

        vectors = _embed_with_openai(job_docs)

        # L2 normalize untuk cosine similarity via inner product
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1e-9, norms)
        vectors = vectors / norms

        dim = vectors.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(vectors)

        logger.info("FAISS index built: %d docs, dim=%d", len(job_docs), dim)
        return {
            "mode": "faiss",
            "index": index,
            "metadatas": job_metas,
            "documents": job_docs,
            "vectorizer": None,
            "matrix": None,
        }

    except Exception as e:
        logger.warning("FAISS index build gagal (%s) — fallback ke TF-IDF shim", e)
        return {
            "mode": "tfidf_fallback",
            "index": None,
            "vectorizer": None,
            "matrix": None,
            "metadatas": job_metas,
            "documents": job_docs,
        }


# ---------------------------------------------------------------------------
# Main search function
# ---------------------------------------------------------------------------

def matches_job_filter(job: dict, filter_city: Optional[str], filter_industry: Optional[str]) -> bool:
    """Post-filter case-insensitive substring match terhadap field city/industry hasil Tavily."""
    if filter_city and filter_city.strip().lower() not in (job.get("city") or "").lower():
        return False
    if filter_industry and filter_industry.strip().lower() not in (job.get("industry") or "").lower():
        return False
    return True


def search_similar_jobs(
    query_text: str,
    n_results: int = 10,
    filter_city: Optional[str] = None,
    filter_industry: Optional[str] = None,
) -> list[dict]:
    """
    Pencarian lowongan semantik real-time:
    1. Tavily → ambil lowongan terbaru
    2. Build FAISS index dari hasil Tavily
    3. Semantic search → return jobs diurutkan by match_score
    4. Opsional: post-filter by city/industry (substring match, case-insensitive)

    Catatan: filter_city/filter_industry hanya efektif untuk hasil yang field
    city/industry-nya terisi dari Tavily — tidak semua hasil pencarian punya field ini.
    """
    logger.info("Pencarian lowongan real-time untuk: '%s'", query_text)

    from tools.tavily_search import search_jobs_tavily

    # Ambil lebih banyak dari Tavily agar filter city/industry masih punya cukup kandidat
    fetch_n = max(n_results * 2, 10) if (filter_city or filter_industry) else max(n_results, 10)
    raw_jobs = search_jobs_tavily(query_text, num_results=fetch_n)

    if not raw_jobs:
        logger.warning("Tavily tidak mengembalikan hasil untuk '%s'", query_text)
        return []

    # Siapkan dokumen untuk indexing
    job_docs = [
        f"{j.get('title', '')} {j.get('company', '')} {j.get('snippet', '')}"
        for j in raw_jobs
    ]

    # Build FAISS index
    try:
        collection = build_faiss_index(job_docs, raw_jobs)
    except Exception as e:
        logger.warning("Index build error: %s — return raw Tavily results", e)
        results = raw_jobs
    else:
        # Search
        if collection.get("mode") == "faiss" and collection.get("index") is not None:
            results = _faiss_search(collection, query_text, fetch_n)
        else:
            results = _tfidf_search_jobs(collection, query_text, fetch_n)

    if filter_city or filter_industry:
        results = [j for j in results if matches_job_filter(j, filter_city, filter_industry)]

    return results[:n_results]


def _faiss_search(collection: dict, query_text: str, n_results: int) -> list[dict]:
    """Semantic search menggunakan FAISS index yang sudah dibangun."""
    try:
        query_vec = _embed_query_openai(query_text)
        # L2 normalize
        norm = np.linalg.norm(query_vec)
        if norm > 0:
            query_vec = query_vec / norm

        index = collection["index"]
        metadatas = collection["metadatas"]

        k = min(n_results, index.ntotal)
        scores, indices = index.search(query_vec, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(metadatas):
                continue
            job = dict(metadatas[idx])
            job["match_score"] = float(max(0, score))
            job["distance"] = float(max(0, 1 - score))
            results.append(job)

        return results

    except Exception as e:
        logger.warning("FAISS search error: %s — fallback TF-IDF", e)
        return _tfidf_search_jobs(collection, query_text, n_results)


def _tfidf_search_jobs(collection: dict, query_text: str, n_results: int) -> list[dict]:
    """TF-IDF fallback search."""
    docs = collection.get("documents", [])
    metas = collection.get("metadatas", [])

    if not docs:
        return []

    scores = _tfidf_scores(docs, query_text)
    top_indices = np.argsort(scores)[::-1][:n_results]

    results = []
    for idx in top_indices:
        if scores[idx] <= 0 or idx >= len(metas):
            continue
        job = dict(metas[idx])
        job["match_score"] = float(scores[idx])
        job["distance"] = float(1 - scores[idx])
        results.append(job)

    return results
