import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative px-md md:px-xl max-w-container-max mx-auto mb-xl">
      <div className="ambient-blob bg-secondary-container w-[400px] h-[400px] -top-20 -left-20"></div>
      <div className="ambient-blob bg-primary-fixed w-[500px] h-[500px] top-40 -right-20"></div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-xl items-center min-h-[70vh]">
        <div className="md:col-span-6 flex flex-col gap-md z-10">
          <div className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container-high border border-outline-variant/50 w-max">
            <span className="material-symbols-outlined text-secondary-container text-sm">verified</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Terintegrasi SKKNI 2024</span>
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary leading-tight">
            Wujudkan Karir Impian dengan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-container">Multi-Agent AI</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Platform pemetaan karir pertama di Indonesia yang menggunakan 5 AI spesialis untuk menganalisis CV Anda dan merancang rute optimal menuju kesuksesan profesional sesuai standar industri nasional.
          </p>
          <div className="flex flex-col sm:flex-row gap-sm pt-sm">
            <Link
              to="/consent"
              className="inline-flex bg-secondary-container text-primary font-headline-sm text-headline-sm px-lg py-sm rounded-lg hover:bg-secondary-fixed-dim transition-all shadow-[0_4px_14px_0_rgba(0,204,249,0.39)] items-center justify-center gap-xs"
            >
              Coba Petakan Karirmu
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <a
              href="#features"
              className="inline-flex bg-surface text-primary border border-outline-variant font-headline-sm text-headline-sm px-lg py-sm rounded-lg hover:bg-surface-container-low transition-all items-center justify-center"
            >
              Lihat Cara Kerja
            </a>
          </div>
        </div>
        <div className="md:col-span-6 relative z-10">
          <div className="glass-panel ai-border-glow rounded-xl p-md transform md:rotate-y-[-5deg] md:rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
            <div className="flex justify-between items-start border-b border-outline-variant/30 pb-sm mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant">
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Budi Santoso</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Target: Senior Backend Developer</p>
                </div>
              </div>
              <div className="bg-surface-container-low px-sm py-xs rounded flex items-center gap-xs border border-outline-variant/50">
                <span className="material-symbols-outlined text-secondary-container text-sm">sync</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Live Analysis</span>
              </div>
            </div>
            <div className="flex items-center justify-center py-md">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="45" stroke="#e5eeff" strokeWidth="8"></circle>
                  <circle
                    className="animate-[pulse_2s_ease-in-out_infinite]"
                    cx="50" cy="50" fill="none" r="45" stroke="#00ccf9"
                    strokeDasharray="283" strokeDashoffset="22" strokeLinecap="round" strokeWidth="8"
                  ></circle>
                </svg>
                <div className="text-center flex flex-col items-center">
                  <span className="font-display-lg-mobile text-display-lg-mobile text-primary leading-none">92%</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">Match Score</span>
                </div>
              </div>
            </div>
            <div className="space-y-sm mt-md">
              <p className="font-label-caps text-label-caps text-on-surface-variant">SKKNI Skill Mapping (Tingkat 6)</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <span className="text-on-surface">Arsitektur Microservices</span>
                  <span className="text-secondary font-bold">100%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary-container w-full rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center font-body-sm text-body-sm">
                  <span className="text-on-surface">Keamanan API</span>
                  <span className="text-secondary font-bold">85%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary-container w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="mt-md pt-sm border-t border-outline-variant/30 text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-xs">
                <span className="material-symbols-outlined text-secondary-container fill-icon text-sm">auto_awesome</span>
                Dianalisis oleh AI Skill Mapper
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
