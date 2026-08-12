import { formatIDR } from "../../lib/format.js";

export default function SalaryBenchmark({ salary }) {
  const { min_idr: minIdr, median_idr: medianIdr, max_idr: maxIdr } = salary || {};
  const max = Math.max(Number(maxIdr) || 1, 1);
  const widthPct = (v) => Math.max(4, Math.round(((Number(v) || 0) / max) * 100)) + "%";

  return (
    <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col">
      <h2 className="font-headline-md text-headline-md text-primary mb-lg flex items-center gap-xs">
        <span className="material-symbols-outlined">payments</span>
        Salary Benchmark
      </h2>
      <div className="flex-grow flex flex-col justify-center gap-md">
        <div className="flex items-center gap-md">
          <span className="font-label-caps text-label-caps text-on-surface-variant w-16">MIN</span>
          <div className="flex-grow h-3 bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-inverse-primary rounded-full" style={{ width: widthPct(minIdr) }}></div>
          </div>
          <span className="font-body-md text-body-md font-semibold text-primary w-32 text-right">{formatIDR(minIdr)}</span>
        </div>
        <div className="flex items-center gap-md relative">
          <div className="absolute -left-md top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary-container rounded-r-full"></div>
          <span className="font-label-caps text-label-caps text-primary w-16 font-bold">MEDIAN</span>
          <div className="flex-grow h-4 bg-surface-variant rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-primary to-secondary-container rounded-full anim-pulse-bg" style={{ width: widthPct(medianIdr) }}></div>
          </div>
          <span className="font-headline-sm text-headline-sm font-bold text-primary w-32 text-right">{formatIDR(medianIdr)}</span>
        </div>
        <div className="flex items-center gap-md">
          <span className="font-label-caps text-label-caps text-on-surface-variant w-16">MAX</span>
          <div className="flex-grow h-3 bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: widthPct(maxIdr) }}></div>
          </div>
          <span className="font-body-md text-body-md font-semibold text-primary w-32 text-right">{formatIDR(maxIdr)}</span>
        </div>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-md pt-sm border-t border-outline-variant/30 text-right">
        Berdasarkan data pasar kerja Indonesia real-time.
      </p>
    </div>
  );
}
