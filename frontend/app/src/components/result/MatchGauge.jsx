function gaugeArcPath(pct) {
  const angle = -180 + (pct / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const x = 50 + 40 * Math.cos(rad);
  const y = 50 + 40 * Math.sin(rad);
  const largeArc = pct > 50 ? 1 : 0;
  return `M 10 50 A 40 40 0 ${largeArc} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

export default function MatchGauge({ percent, caption }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));

  return (
    <div className="lg:col-span-4 glass-panel rounded-xl p-md flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center gap-xs text-secondary-container">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>temp_preferences_custom</span>
        <span className="font-label-caps text-label-caps uppercase text-primary">AI MATCH</span>
      </div>
      <div className="relative w-48 h-48 mt-lg">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e0e3e5" strokeLinecap="round" strokeWidth="8"></path>
          <path
            className="drop-shadow-[0_0_8px_rgba(0,204,249,0.5)]"
            d={gaugeArcPath(clamped)}
            fill="none" stroke="#00ccf9" strokeLinecap="round" strokeWidth="8"
          ></path>
        </svg>
        <div className="absolute bottom-4 left-0 w-full text-center flex flex-col items-center">
          <span className="font-display-lg text-display-lg text-primary">
            {Math.round(clamped)}<span className="text-headline-md">%</span>
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Match Score</span>
        </div>
      </div>
      <p className="font-body-sm text-body-sm text-center mt-sm text-on-surface-variant">
        {caption || "Analisis kecocokan profil dengan pasar kerja."}
      </p>
    </div>
  );
}
