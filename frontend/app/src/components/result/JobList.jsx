export default function JobList({ jobs = [] }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col">
      <h2 className="font-headline-sm text-headline-sm text-primary mb-md">Active Job Matches</h2>
      <div className="flex flex-col gap-sm">
        {jobs.length ? (
          jobs.map((j, i) => (
            <a
              key={i}
              href={j.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-between items-center p-sm border border-outline-variant/30 rounded-lg hover:shadow-sm transition-shadow bg-surface-bright"
            >
              <div className="flex gap-sm items-center min-w-0">
                <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-primary">work</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-body-sm text-body-sm font-semibold text-primary truncate">{j.title || "Lowongan"}</h4>
                  <p className="font-label-caps text-label-caps text-on-surface-variant truncate">
                    {j.company || j.source || ""} {j.city ? `• ${j.city}` : ""}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline shrink-0">arrow_forward_ios</span>
            </a>
          ))
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Tidak ada lowongan yang cocok ditemukan.</p>
        )}
      </div>
    </div>
  );
}
