const STEPS = [
  { icon: "upload_file", iconColor: "text-primary", bg: "bg-primary-fixed", title: "1. Unggah Data", desc: "Upload CV atau isi profil LinkedIn Anda. Sistem kami memproses data awal Anda." },
  { icon: "psychology", iconColor: "text-secondary-container fill-icon", bg: "bg-secondary-fixed", title: "2. Analisis Agen", desc: "5 AI Agents mengevaluasi profil Anda terhadap tren pasar dan standar nasional." },
  { icon: "troubleshoot", iconColor: "text-primary", bg: "bg-primary-fixed", title: "3. Skill Gap Mapping", desc: "Identifikasi celah keahlian antara kondisi saat ini dengan target karir SKKNI." },
  { icon: "map", iconColor: "text-primary", bg: "bg-surface-container-high", title: "4. Career Roadmap", desc: "Dapatkan rencana aksi langkah-demi-langkah, rekomendasi kursus, dan sertifikasi." },
];

const AGENTS = [
  { icon: "account_tree", iconFill: true, title: "SKKNI Skill Mapper", desc: "Menerjemahkan pengalaman Anda ke dalam bahasa kompetensi SKKNI resmi, memetakan level Anda dari operator hingga ahli.", span: "md:col-span-4" },
  { icon: "monitoring", title: "Market Researcher", desc: "Menganalisis tren industri dan pergeseran permintaan keahlian di pasar kerja Indonesia.", span: "md:col-span-2" },
  { icon: "description", title: "CV Optimizer", desc: "Menyusun ulang CV Anda agar lulus sistem ATS dan menonjolkan keahlian kunci SKKNI.", span: "md:col-span-2" },
  { icon: "radar", title: "Job Scout", desc: "Mencari dan menyaring lowongan pekerjaan yang memiliki kecocokan (Match Score) tertinggi dengan profil Anda.", span: "md:col-span-2" },
  { icon: "payments", title: "Salary Benchmarker", desc: "Memberikan estimasi nilai pasar keahlian Anda untuk negosiasi gaji yang lebih kuat.", span: "md:col-span-2" },
];

export default function Features() {
  return (
    <section id="features" className="px-md md:px-xl max-w-container-max mx-auto mb-xl scroll-mt-24">
      <div className="mb-xl">
        <div className="text-center mb-lg">
          <h2 className="font-headline-md text-headline-md md:font-display-lg-mobile md:text-display-lg-mobile text-primary mb-xs">Cara Kerja Cerah AI</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Proses saintifik berbasis AI untuk memetakan masa depan karir Anda hanya dalam 4 langkah mudah.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-high -translate-y-1/2 z-0"></div>
          {STEPS.map((s) => (
            <div key={s.title} className="bg-white border border-outline-variant rounded-xl p-md relative z-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className={`w-16 h-16 rounded-full ${s.bg} flex items-center justify-center mb-md border-4 border-surface shadow-sm`}>
                <span className={`material-symbols-outlined ${s.iconColor} text-3xl`}>{s.icon}</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">{s.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="agents" className="relative scroll-mt-24">
        <div className="ambient-blob bg-primary-fixed-dim w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="text-center mb-lg relative z-10">
          <h2 className="font-headline-md text-headline-md md:font-display-lg-mobile md:text-display-lg-mobile text-primary mb-xs">Sistem Multi-Agent Kami</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Bukan sekadar satu AI, melainkan dewan pakar virtual yang bekerja sinkron untuk memajukan karir Anda.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-md relative z-10 auto-rows-[minmax(180px,auto)]">
          {AGENTS.map((a) => (
            <div key={a.title} className={`glass-panel ai-border-glow rounded-xl p-md ${a.span} flex flex-col justify-between group cursor-pointer hover:bg-white/90 transition-colors`}>
              <div className="flex justify-between items-start mb-sm">
                <div className="bg-primary/5 p-sm rounded-lg">
                  <span className={`material-symbols-outlined text-3xl ${a.iconFill ? "text-secondary-container fill-icon" : "text-primary"}`}>{a.icon}</span>
                </div>
                <span className="material-symbols-outlined text-secondary-container opacity-50 group-hover:opacity-100 transition-opacity">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">{a.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
