"""
LLM Factory — Per-agent model assignment, multi-provider.

Profiler & Analyst (paralel)      → Google Gemini
Gap Analyzer & Strategist (sequential) → Groq

Setiap agent bisa dikonfigurasi model yang berbeda via .env — tidak perlu ubah kode.
Kedua provider expose endpoint OpenAI-compatible, jadi ChatOpenAI (langchain_openai)
tetap dipakai untuk keduanya — hanya base_url/api_key yang berbeda per provider.

Shared settings (dari .env):
  AI_MAX_TOKENS                   — max output tokens (default: 1200)
  AI_TEMPERATURE                  — temperature untuk agent ekstraksi (default: 0.35)
  AI_RECOMMENDATION_TEMPERATURE   — temperature untuk Strategist (default: 0.3)
"""
import os
import logging
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

# Google Gemini — Profiler + Analyst
GOOGLE_API_KEY  = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_BASE_URL = os.getenv("GOOGLE_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")

# Groq — Gap Analyzer + Strategist
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

# Model per agent — dikonfigurasi via .env
PROFILER_MODEL   = os.getenv("PROFILER_MODEL",   "gemini-2.5-flash")
ANALYST_MODEL    = os.getenv("ANALYST_MODEL",    "gemini-2.5-flash")
GAP_MODEL        = os.getenv("GAP_MODEL",        "llama-3.3-70b-versatile")
STRATEGIST_MODEL = os.getenv("STRATEGIST_MODEL", "llama-3.3-70b-versatile")

# Shared LLM settings
AI_MAX_TOKENS                 = int(os.getenv("AI_MAX_TOKENS", "1200"))
AI_TEMPERATURE                = float(os.getenv("AI_TEMPERATURE", "0.35"))
AI_RECOMMENDATION_TEMPERATURE = float(os.getenv("AI_RECOMMENDATION_TEMPERATURE", "0.3"))


def strip_json_fence(raw: str) -> str:
    """
    Strip markdown code fences (```json ... ``` atau ``` ... ```) dari respons LLM.
    Aman terhadap fence yang tidak lengkap — fallback ke raw asli jika split gagal.
    """
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        if len(parts) > 1:
            raw = parts[1]
            if raw.startswith("json"):
                raw = raw[4:]
    return raw.strip()


def _build_llm(model: str, api_key: str, base_url: str, provider_name: str, temperature: float, max_tokens: int) -> ChatOpenAI:
    if not api_key:
        raise EnvironmentError(
            f"{provider_name} API key tidak ditemukan. Set env var yang sesuai di .env "
            f"({'GOOGLE_API_KEY' if provider_name == 'Google Gemini' else 'GROQ_API_KEY'})."
        )
    logger.debug(f"LLM: {provider_name} model={model} temp={temperature} max_tokens={max_tokens}")
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        base_url=base_url,
        temperature=temperature,
        max_tokens=max_tokens,
    )


def get_profiler_llm(temperature: float = None, max_tokens: int = None) -> ChatOpenAI:
    """
    Profiler Agent — berjalan PARALEL dengan Analyst.
    Provider: Google Gemini. Override model: set PROFILER_MODEL di .env.
    """
    return _build_llm(
        model=PROFILER_MODEL,
        api_key=GOOGLE_API_KEY,
        base_url=GOOGLE_BASE_URL,
        provider_name="Google Gemini",
        temperature=temperature if temperature is not None else AI_TEMPERATURE,
        max_tokens=max_tokens if max_tokens is not None else AI_MAX_TOKENS,
    )


def get_analyst_llm(temperature: float = None, max_tokens: int = None) -> ChatOpenAI:
    """
    Market Analyst Agent — berjalan PARALEL dengan Profiler.
    Provider: Google Gemini. Override model: set ANALYST_MODEL di .env.
    """
    return _build_llm(
        model=ANALYST_MODEL,
        api_key=GOOGLE_API_KEY,
        base_url=GOOGLE_BASE_URL,
        provider_name="Google Gemini",
        temperature=temperature if temperature is not None else AI_TEMPERATURE,
        max_tokens=max_tokens if max_tokens is not None else AI_MAX_TOKENS,
    )


def get_gap_llm(temperature: float = None, max_tokens: int = None) -> ChatOpenAI:
    """
    Gap Analyzer Agent — sequential (Fan-In), butuh reasoning lebih baik.
    Provider: Groq. Override model: set GAP_MODEL di .env.
    """
    return _build_llm(
        model=GAP_MODEL,
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
        provider_name="Groq",
        temperature=temperature if temperature is not None else AI_TEMPERATURE,
        max_tokens=max_tokens if max_tokens is not None else AI_MAX_TOKENS,
    )


def get_strategist_llm(temperature: float = None, max_tokens: int = None) -> ChatOpenAI:
    """
    Strategist Agent — sequential, output terpanjang (roadmap 6 bulan Bahasa Indonesia).
    Provider: Groq. Override model: set STRATEGIST_MODEL di .env.
    Uses AI_RECOMMENDATION_TEMPERATURE by default.
    """
    return _build_llm(
        model=STRATEGIST_MODEL,
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
        provider_name="Groq",
        temperature=temperature if temperature is not None else AI_RECOMMENDATION_TEMPERATURE,
        max_tokens=max_tokens if max_tokens is not None else AI_MAX_TOKENS,
    )


# ---------------------------------------------------------------------------
# Legacy aliases — dipertahankan agar tidak ada import error di file lain
# yang masih memanggil get_fast_llm() / get_quality_llm()
# ---------------------------------------------------------------------------
def get_fast_llm(temperature: float = None, max_tokens: int = None) -> ChatOpenAI:
    """Alias untuk get_profiler_llm() — backward compat."""
    return get_profiler_llm(temperature=temperature, max_tokens=max_tokens)


def get_quality_llm(temperature: float = None, max_tokens: int = None) -> ChatOpenAI:
    """Alias untuk get_gap_llm() — backward compat."""
    return get_gap_llm(temperature=temperature, max_tokens=max_tokens)
