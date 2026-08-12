export default function SkkniMapping({ targetRole, categories = [], summary }) {
  return (
    <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
      <div className="flex justify-between items-center mb-md">
        <h2 className="font-headline-sm text-headline-sm text-primary">SKKNI Category Mapping</h2>
        <span className="bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps px-sm py-xs rounded-full">
          Target: {targetRole || "—"}
        </span>
      </div>
      <div className="flex flex-wrap gap-sm">
        {categories.length ? (
          categories.map((k) => (
            <span
              key={k}
              className="bg-surface-container-low border border-outline-variant text-on-surface font-body-sm text-body-sm px-md py-xs rounded-full"
            >
              {k}
            </span>
          ))
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Tidak ada kategori SKKNI yang teridentifikasi.</p>
        )}
      </div>
      {summary && <p className="font-body-sm text-body-sm text-on-surface-variant mt-md">{summary}</p>}
    </div>
  );
}
