const MODULES = [
  { platform: "Coursera", title: "AI For Everyone", author: "DeepLearning.AI" },
  { platform: "Udemy", title: "Python for Data Science", author: "Jose Portilla" },
  { platform: "Google", title: "Data Analytics Cert", author: "Google Career Certs" },
];

export default function ModuleRecommendations() {
  return (
    <section className="flex flex-col gap-md">
      <h2 className="font-headline-md text-headline-md text-primary">Rekomendasi Modul</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
        {MODULES.map((m) => (
          <div key={m.title} className="glass-panel rounded-xl p-sm flex flex-col gap-xs">
            <div className="w-full h-20 bg-surface-variant rounded-lg flex items-center justify-center mb-xs">
              <span className="font-bold text-primary">{m.platform}</span>
            </div>
            <h4 className="font-body-sm font-bold text-primary truncate">{m.title}</h4>
            <span className="text-[12px] text-outline">{m.author}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
