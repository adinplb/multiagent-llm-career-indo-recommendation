const ARTICLES = [
  {
    icon: "article",
    iconBg: "bg-primary-container",
    iconColor: "text-secondary-fixed",
    title: "Navigasi Pasar Kerja Digital 2024",
    desc: "Strategi menghadapi rekrutmen berbasis AI dan optimasi profil LinkedIn.",
  },
  {
    icon: "psychology",
    iconBg: "bg-secondary-container/20",
    iconColor: "text-secondary",
    title: "Memahami Standar SKKNI",
    desc: "Mengapa sertifikasi kompetensi nasional krusial untuk karir IT Anda.",
  },
];

export default function EducationCard() {
  return (
    <section className="flex flex-col gap-md">
      <div className="flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-primary">Literasi Digital & Karir</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {ARTICLES.map((a) => (
          <div key={a.title} className="glass-panel rounded-xl overflow-hidden flex flex-col hover:bg-surface-variant transition-colors cursor-pointer">
            <div className={`h-24 ${a.iconBg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${a.iconColor} text-4xl`}>{a.icon}</span>
            </div>
            <div className="p-md">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">{a.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
