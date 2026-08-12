export default function Stats() {
  const stats = [
    { value: "150k+", label: "Job Listings Dianalisis" },
    { value: "3k+", label: "Unit Kompetensi SKKNI" },
    { value: "5", label: "AI Agents Aktif Bekerja", accent: true },
  ];

  return (
    <section className="bg-surface-container-low py-lg border-y border-outline-variant/20 mb-xl">
      <div className="max-w-container-max mx-auto px-md md:px-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md text-center divide-y md:divide-y-0 md:divide-x divide-outline-variant/30">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center py-sm md:py-0">
              <span className={`font-display-lg-mobile text-display-lg-mobile ${s.accent ? "text-secondary-container drop-shadow-sm" : "text-primary"}`}>
                {s.value}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
