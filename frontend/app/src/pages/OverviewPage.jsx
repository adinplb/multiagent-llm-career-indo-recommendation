import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import EducationCard from "../components/overview/EducationCard.jsx";
import WebinarList from "../components/overview/WebinarList.jsx";
import ModuleRecommendations from "../components/overview/ModuleRecommendations.jsx";
import { fetchHistory } from "../lib/api.js";

export default function OverviewPage() {
  const [historyCount, setHistoryCount] = useState(null); // null = loading, -1 = error

  useEffect(() => {
    fetchHistory()
      .then((items) => setHistoryCount(items.length))
      .catch(() => setHistoryCount(-1));
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-row">
      <DashboardSidebar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-lg py-xl flex flex-col gap-xl">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div className="flex flex-col gap-sm">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
              Selamat datang kembali
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              {historyCount === null
                ? "Memuat ringkasan riwayat analisis Anda..."
                : historyCount === -1
                ? "Anda memiliki riwayat analisis karier di Cerah AI."
                : historyCount === 0
                ? "Anda belum memiliki riwayat analisis. Mulai analisis karier pertama Anda."
                : `Anda memiliki ${historyCount} riwayat analisis karier tersimpan.`}
            </p>
          </div>
          <Link
            to="/analyze"
            className="shrink-0 inline-flex items-center justify-center gap-xs bg-primary text-on-primary font-headline-sm text-headline-sm px-lg py-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">psychology</span>
            Analyze Career
          </Link>
        </header>

        <EducationCard />
        <WebinarList />
        <ModuleRecommendations />
      </main>
    </div>
  );
}
