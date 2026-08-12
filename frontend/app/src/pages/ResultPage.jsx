import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadResult } from "../lib/api.js";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import MatchGauge from "../components/result/MatchGauge.jsx";
import SalaryBenchmark from "../components/result/SalaryBenchmark.jsx";
import SkillRadar from "../components/result/SkillRadar.jsx";
import SkkniMapping from "../components/result/SkkniMapping.jsx";
import RoadmapTimeline from "../components/result/RoadmapTimeline.jsx";
import BootcampList from "../components/result/BootcampList.jsx";
import JobList from "../components/result/JobList.jsx";

export default function ResultPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(undefined); // undefined = belum dicek, null = tidak ada

  useEffect(() => {
    const result = loadResult();
    if (!result) {
      navigate("/analyze", { replace: true });
      return;
    }
    setData(result);
  }, [navigate]);

  if (!data) return null;

  const userProfile = data.user_profile || {};
  const marketData = data.market_data || {};
  const skillGaps = data.skill_gaps || {};
  const roadmap = data.roadmap || "";

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link disalin ke clipboard.");
    } catch (e) {
      alert("Gagal menyalin link.");
    }
  }

  function handleShareLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener");
  }

  const analisisGap = skillGaps.analisis_gap
    ? skillGaps.analisis_gap.slice(0, 120) + (skillGaps.analisis_gap.length > 120 ? "…" : "")
    : undefined;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-row">
      <DashboardSidebar />

      <div className="flex flex-col flex-grow w-full min-w-0">
        <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-xl py-xl space-y-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-lg">
            <div>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
                {data.target_role || "Career Analysis"}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Career Analysis Report based on SKKNI Standards</p>
            </div>
            <div className="flex flex-wrap gap-sm">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-xs px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body-sm hover:shadow-[0_2px_8px_rgba(0,103,127,0.1)] transition-shadow"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="flex items-center gap-xs px-4 py-2 bg-primary text-on-primary rounded-lg font-body-sm hover:shadow-[0_2px_8px_rgba(0,103,127,0.1)] transition-shadow"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                Share to LinkedIn
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-xs px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body-sm hover:shadow-[0_2px_8px_rgba(0,103,127,0.1)] transition-shadow"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                Copy Link
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-md">
            <MatchGauge percent={skillGaps.persentase_kecocokan} caption={analisisGap} />
            <SalaryBenchmark salary={marketData.rata_rata_gaji} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-md">
            <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col items-center">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-md self-start flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">radar</span> Skill Radar
              </h2>
              <SkillRadar owned={skillGaps.keahlian_dimiliki} missing={skillGaps.keahlian_kurang} />
            </div>
            <SkkniMapping targetRole={data.target_role} categories={userProfile.skkni_kategori} summary={userProfile.ringkasan} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <RoadmapTimeline roadmap={roadmap} />
            <BootcampList items={marketData.bootcamp_info} />
            <JobList jobs={marketData.pekerjaan_lokal} />
          </section>
        </main>

        <footer className="bg-surface-container w-full py-md px-lg flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto border-t border-outline-variant mt-auto">
          <div className="font-headline-sm text-headline-sm font-semibold text-primary mb-4 md:mb-0">© 2024 Cerah AI. Powered by SKKNI Standards.</div>
          <ul className="flex flex-wrap gap-md justify-center font-body-sm text-body-sm">
            <li><a className="text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a></li>
            <li><a className="text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a></li>
            <li><a className="text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Institutional Partners</a></li>
            <li><a className="text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Contact Support</a></li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
