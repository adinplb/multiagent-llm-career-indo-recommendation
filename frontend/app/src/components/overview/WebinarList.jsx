const WEBINARS = [
  {
    org: "BINAR ACADEMY",
    title: "Masterclass: Data Science for Career Switchers",
    schedule: "Sabtu, 15 Juni • 10:00 WIB",
    accent: "border-l-secondary-container",
  },
  {
    org: "HACKTIV8",
    title: "Workshop: Building AI Agents with Python",
    schedule: "Minggu, 16 Juni • 13:00 WIB",
    accent: "border-l-primary",
  },
];

export default function WebinarList() {
  return (
    <section className="flex flex-col gap-md">
      <h2 className="font-headline-md text-headline-md text-primary">Webinar & Workshop</h2>
      <div className="flex flex-col gap-sm">
        {WEBINARS.map((w) => (
          <div key={w.title} className={`glass-panel rounded-xl p-md flex items-center justify-between border-l-4 ${w.accent}`}>
            <div className="flex flex-col">
              <span className="font-label-caps text-secondary font-bold">{w.org}</span>
              <h3 className="font-body-lg font-bold text-primary">{w.title}</h3>
              <span className="font-body-sm text-on-surface-variant">{w.schedule}</span>
            </div>
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps hover:opacity-90 shrink-0">
              Daftar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
