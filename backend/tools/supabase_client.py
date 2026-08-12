"""
Supabase Client — Penyimpanan riwayat analisis karier (fitur History).

Diakses HANYA dari backend (service role key, tidak pernah dikirim ke browser).
Identitas "pemilik" riwayat memakai client_id (UUID per-browser dari localStorage,
BUKAN autentikasi sungguhan) — cukup untuk pemisahan riwayat per-browser tanpa
membangun sistem akun.

Semua fungsi fail-safe terhadap penyimpanan: insert_history() tidak pernah
melempar exception (analisis yang sudah berhasil tidak boleh gagal hanya karena
gagal disimpan) — tapi list/get/delete tetap melempar agar endpoint bisa
mengembalikan error yang jelas ke frontend.
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    from supabase import create_client
    _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _client


def is_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_KEY)


def insert_history(client_id: str, target_role: str, cv_filename: str, match_percentage: Optional[int], result: dict) -> None:
    """Simpan satu riwayat analisis. Fail-safe: kegagalan hanya di-log, tidak melempar."""
    client = _get_client()
    if client is None:
        logger.warning("Supabase belum dikonfigurasi — riwayat analisis tidak disimpan.")
        return
    try:
        client.table("analysis_history").insert({
            "client_id": client_id,
            "target_role": target_role,
            "cv_filename": cv_filename,
            "match_percentage": match_percentage,
            "result": result,
        }).execute()
    except Exception as e:
        logger.warning("Gagal menyimpan riwayat analisis ke Supabase: %s", e)


def list_history(client_id: str) -> list[dict]:
    """List ringkas riwayat milik client_id, terbaru dulu. Tidak menyertakan payload 'result' penuh."""
    client = _get_client()
    if client is None:
        raise RuntimeError("Supabase belum dikonfigurasi di server.")
    response = (
        client.table("analysis_history")
        .select("id, target_role, cv_filename, match_percentage, created_at")
        .eq("client_id", client_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


def get_history_detail(client_id: str, history_id: str) -> Optional[dict]:
    """Ambil satu riwayat lengkap (termasuk 'result' penuh) milik client_id."""
    client = _get_client()
    if client is None:
        raise RuntimeError("Supabase belum dikonfigurasi di server.")
    response = (
        client.table("analysis_history")
        .select("id, target_role, cv_filename, match_percentage, result, created_at")
        .eq("client_id", client_id)
        .eq("id", history_id)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def delete_history(client_id: str, history_id: str) -> bool:
    """Hapus satu riwayat milik client_id. Return True jika ada row yang terhapus."""
    client = _get_client()
    if client is None:
        raise RuntimeError("Supabase belum dikonfigurasi di server.")
    response = (
        client.table("analysis_history")
        .delete()
        .eq("client_id", client_id)
        .eq("id", history_id)
        .execute()
    )
    return len(response.data) > 0


def delete_all_history(client_id: str) -> int:
    """Hapus semua riwayat milik client_id. Return jumlah row yang terhapus."""
    client = _get_client()
    if client is None:
        raise RuntimeError("Supabase belum dikonfigurasi di server.")
    response = (
        client.table("analysis_history")
        .delete()
        .eq("client_id", client_id)
        .execute()
    )
    return len(response.data)
