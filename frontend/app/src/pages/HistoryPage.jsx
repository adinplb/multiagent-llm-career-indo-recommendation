import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import { fetchHistory, fetchHistoryDetail, deleteHistoryItem, deleteAllHistory, saveResult } from "../lib/api.js";

function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [openingId, setOpeningId] = useState(null);

  const loadHistory = useCallback(() => {
    setError(null);
    fetchHistory()
      .then(setItems)
      .catch((err) => setError(err.message || "Gagal memuat riwayat."));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleOpen(id) {
    setOpeningId(id);
    try {
      const detail = await fetchHistoryDetail(id);
      saveResult(detail.result);
      navigate("/result");
    } catch (err) {
      setError(err.message || "Gagal membuka riwayat.");
      setOpeningId(null);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm("Hapus riwayat analisis ini secara permanen?")) return;
    try {
      await deleteHistoryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Gagal menghapus riwayat.");
    }
  }

  async function handleDeleteAll() {
    if (!items || items.length === 0) return;
    if (!window.confirm(`Hapus SEMUA ${items.length} riwayat analisis secara permanen? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await deleteAllHistory();
      setItems([]);
    } catch (err) {
      setError(err.message || "Gagal menghapus semua riwayat.");
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-row">
      <DashboardSidebar />

      <main className="flex-grow w-full max-w-3xl mx-auto px-lg py-xl flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-xs">Riwayat Analisis</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Daftar analisis karier yang pernah Anda jalankan di browser ini.
            </p>
          </div>
          {items && items.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="shrink-0 flex items-center gap-xs px-lg py-sm bg-error-container text-on-error-container rounded-lg font-body-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              Hapus Semua Riwayat
            </button>
          )}
        </header>

        {error && (
          <p className="bg-error-container text-on-error-container px-md py-sm rounded-lg font-body-sm text-body-sm">{error}</p>
        )}

        {items === null && !error && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Memuat riwayat...</p>
        )}

        {items !== null && items.length === 0 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center text-center gap-md">
            <span className="material-symbols-outlined text-outline text-[48px]">history</span>
            <p className="font-body-md text-body-md text-on-surface-variant">Belum ada riwayat analisis.</p>
            <button
              onClick={() => navigate("/analyze")}
              className="bg-primary text-on-primary px-lg py-sm rounded-lg font-body-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Mulai Analisis Pertama
            </button>
          </div>
        )}

        {items && items.length > 0 && (
          <div className="flex flex-col gap-sm">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpen(item.id)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between gap-md hover:shadow-sm hover:border-secondary-container/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-md min-w-0">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">work</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-body-md font-semibold text-primary truncate">{item.target_role}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {item.cv_filename || "CV tanpa nama"} • {formatRelativeDate(item.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-sm shrink-0">
                  {typeof item.match_percentage === "number" && (
                    <span className="bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps px-sm py-xs rounded-full">
                      {item.match_percentage}% match
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 rounded-lg text-outline hover:text-error hover:bg-error-container transition-colors"
                    title="Hapus riwayat ini"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                  <span className="material-symbols-outlined text-outline">
                    {openingId === item.id ? "hourglass_empty" : "arrow_forward_ios"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
