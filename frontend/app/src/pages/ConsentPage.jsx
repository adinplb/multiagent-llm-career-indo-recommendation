import { useNavigate } from "react-router-dom";

export default function ConsentPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-container filter blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-surface-container-high filter blur-[100px]"></div>
      </div>
      <main className="flex-grow flex items-center justify-center p-md md:p-xl relative z-10 w-full">
        <div className="glass-panel w-full max-w-2xl rounded-xl shadow-[0_8px_32px_rgba(4,22,39,0.05)] overflow-hidden animate-fade-in-up">
          <div className="p-lg border-b border-outline-variant/30 flex items-center gap-sm bg-surface-container-lowest/50">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>verified_user</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary m-0">Persetujuan Penggunaan Data AI</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Cerah AI Privacy &amp; Data Policy</p>
            </div>
          </div>
          <div className="p-lg space-y-md bg-surface-container-lowest/30">
            <p className="font-body-md text-body-md text-on-surface">
              Untuk memberikan rekomendasi karier yang akurat dan pemetaan SKKNI yang tepat, Cerah AI membutuhkan persetujuan Anda untuk memproses data profil dan riwayat pekerjaan Anda.
            </p>
            <div className="space-y-sm mt-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Bagaimana data Anda digunakan:</h3>
              <ul className="space-y-sm">
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary-container mt-1" style={{ fontSize: 20 }}>check_circle</span>
                  <div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface block">Pemetaan SKKNI (Standar Kompetensi Kerja Nasional Indonesia)</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Menganalisis keterampilan Anda untuk mencocokkan dengan standar nasional industri.</span>
                  </div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary-container mt-1" style={{ fontSize: 20 }}>check_circle</span>
                  <div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface block">Rekomendasi Jalur Karier (Career Pathfinder)</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Memberikan saran peran dan peningkatan keterampilan (upskilling) berbasis AI.</span>
                  </div>
                </li>
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary-container mt-1" style={{ fontSize: 20 }}>check_circle</span>
                  <div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface block">Optimalisasi CV</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Meningkatkan profil profesional Anda berdasarkan tren pasar kerja saat ini.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-surface-container-low p-md rounded-lg mt-md border border-outline-variant/30 flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary mt-1" style={{ fontSize: 20 }}>lock</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
                Data Anda dienkripsi dengan aman dan tidak akan pernah dijual kepada pihak ketiga. Anda dapat menarik persetujuan kapan saja melalui Pengaturan Profil.
              </p>
            </div>
          </div>
          <div className="p-lg bg-surface-container-lowest/80 border-t border-outline-variant/30 flex flex-col sm:flex-row-reverse items-center justify-between gap-md">
            <button
              onClick={() => navigate("/analyze")}
              className="w-full sm:w-auto bg-primary text-on-primary hover:bg-primary-container px-lg py-sm rounded-lg font-body-md text-body-md font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Setujui &amp; Lanjutkan
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto text-on-surface-variant hover:text-primary font-body-md text-body-md px-lg py-sm transition-colors text-center"
            >
              Batal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
