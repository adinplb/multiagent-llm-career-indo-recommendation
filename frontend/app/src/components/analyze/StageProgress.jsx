import { STAGES } from "../../hooks/useAnalysisStream.js";

function StageIcon({ status }) {
  if (status === "done") {
    return (
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
    );
  }
  if (status === "started") {
    return (
      <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>
        sync
      </span>
    );
  }
  return <span className="material-symbols-outlined">schedule</span>;
}

export default function StageProgress({ stageStatus }) {
  const doneCount = STAGES.filter((s) => stageStatus[s.key] === "done").length;
  const percent = Math.round((doneCount / STAGES.length) * 100);

  return (
    <section className="glass-card rounded-xl p-md flex flex-col gap-md">
      <div className="flex justify-between items-center px-sm">
        <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Overall Progress</div>
        <div className="font-label-caps text-label-caps text-secondary font-bold">{percent}%</div>
      </div>
      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary-container transition-all duration-500"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="grid grid-cols-4 gap-sm mt-sm">
        {STAGES.map((s) => {
          const status = stageStatus[s.key];
          const boxClasses =
            status === "done"
              ? "bg-secondary-fixed text-primary"
              : status === "started"
              ? "bg-primary text-on-primary ring-4 ring-secondary-container/30"
              : "bg-surface-container text-on-surface-variant opacity-50";
          const textClasses =
            status === "done" ? "text-on-surface" : status === "started" ? "text-primary font-bold" : "text-on-surface-variant";
          return (
            <div key={s.key} className="flex flex-col items-center gap-xs text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${boxClasses}`}>
                <StageIcon status={status} />
              </div>
              <span className={`font-label-caps text-label-caps ${textClasses}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
