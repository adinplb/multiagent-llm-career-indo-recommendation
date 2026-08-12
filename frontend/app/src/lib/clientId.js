const CLIENT_ID_KEY = "cerahAiClientId";

/**
 * ID per-browser (bukan autentikasi sungguhan) dipakai untuk memisahkan riwayat
 * analisis antar pengguna tanpa sistem akun. Siapapun yang tahu ID ini bisa
 * mengakses riwayat terkait — cukup untuk kebutuhan "riwayat pribadi per-browser".
 */
export function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function resetClientId() {
  const id = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}
