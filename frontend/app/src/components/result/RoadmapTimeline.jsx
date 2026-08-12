import { useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { parseRoadmapSections } from "../../lib/roadmap.js";

export default function RoadmapTimeline({ roadmap }) {
  const [showFull, setShowFull] = useState(false);
  const sections = parseRoadmapSections(roadmap);

  return (
    <div className="glass-panel rounded-xl p-md flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-sm">
        <span className="material-symbols-outlined text-secondary-container text-[48px] opacity-20">timeline</span>
      </div>
      <h2 className="font-headline-sm text-headline-sm text-primary mb-md">6-Month Roadmap</h2>
      <div className="relative pl-6 border-l-2 border-surface-variant flex flex-col gap-md flex-grow">
        {sections.length ? (
          sections.slice(0, 3).map((s, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${i === 0 ? "bg-secondary-container" : "bg-surface-variant"}`}></div>
              <span className={`font-label-caps text-label-caps font-bold ${i === 0 ? "text-secondary" : "text-on-surface-variant"}`}>{s.title}</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                {s.body.replace(/\n+/g, " ").slice(0, 160)}
                {s.body.length > 160 ? "…" : ""}
              </p>
            </div>
          ))
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Roadmap belum tersedia.</p>
        )}
      </div>
      <div className="mt-md pt-sm border-t border-outline-variant/30">
        <button
          type="button"
          className="text-secondary font-body-sm font-semibold hover:underline"
          onClick={() => setShowFull((v) => !v)}
        >
          {showFull ? "Sembunyikan roadmap lengkap" : "Lihat roadmap lengkap"}
        </button>
        {showFull && (
          <div
            className="mt-sm font-body-sm text-on-surface-variant prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(roadmap || "")) }}
          />
        )}
      </div>
    </div>
  );
}
