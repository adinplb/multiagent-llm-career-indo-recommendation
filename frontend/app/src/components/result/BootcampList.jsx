export default function BootcampList({ items = [] }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col">
      <h2 className="font-headline-sm text-headline-sm text-primary mb-md">Recommended Bootcamps</h2>
      <div className="flex flex-col gap-sm">
        {items.length ? (
          items.map((b, i) => (
            <a
              key={i}
              href={b.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-sm rounded-lg border border-outline-variant/30 hover:border-secondary-container/50 hover:bg-surface transition-all cursor-pointer flex gap-sm items-center"
            >
              <div className="w-12 h-12 rounded bg-surface-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">school</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-body-md text-body-md font-semibold text-primary truncate">{b.platform || "Program Belajar"}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{b.title || ""}</p>
              </div>
            </a>
          ))
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Tidak ada rekomendasi bootcamp saat ini.</p>
        )}
      </div>
    </div>
  );
}
