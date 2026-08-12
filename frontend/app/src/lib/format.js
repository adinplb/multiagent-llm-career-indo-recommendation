/** Format angka rupiah gaya Indonesia: 18000000 -> "Rp 18.000.000" */
export function formatIDR(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "N/A";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}
