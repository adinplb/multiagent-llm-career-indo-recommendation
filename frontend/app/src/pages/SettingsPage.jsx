import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import { clearResult } from "../lib/api.js";
import { resetClientId } from "../lib/clientId.js";

export default function SettingsPage() {
  const [cleared, setCleared] = useState(false);

  function handleClearLocalData() {
    const confirmed = window.confirm(
      "Ini akan menghapus data sesi lokal dan mengganti ID browser Anda. " +
      "Riwayat analisis yang sudah tersimpan tidak akan bisa diakses lagi dari browser ini " +
      "(datanya tetap ada di server, hanya tertaut ke ID lama). Lanjutkan?"
    );
    if (!confirmed) return;

    clearResult();
    resetClientId();
    setCleared(true);
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-row">
      <DashboardSidebar />

      <main className="flex-grow w-full max-w-3xl mx-auto px-lg py-xl flex flex-col gap-xl">
        <header className="flex flex-col gap-sm">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Preferensi disimpan secara lokal di browser ini. Cerah AI belum memiliki sistem akun,
            jadi pengaturan berikut bersifat per-browser, bukan per-pengguna.
          </p>
        </header>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-xs">Data Lokal</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Hapus hasil analisis yang tersimpan sementara di browser ini dan buat ID browser baru.
              Berguna jika Anda ingin memulai riwayat baru dari perangkat ini.
            </p>
          </div>
          <div>
            <button
              onClick={handleClearLocalData}
              className="bg-error text-on-error px-lg py-sm rounded-lg font-body-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Hapus Data Lokal
            </button>
            {cleared && (
              <p className="font-body-sm text-body-sm text-secondary mt-sm">
                Data lokal telah dihapus dan ID browser baru dibuat.
              </p>
            )}
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">Tentang</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Cerah AI — Multi-Agent Career Recommendation System</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Versi 2.0.0</p>
        </section>
      </main>
    </div>
  );
}
