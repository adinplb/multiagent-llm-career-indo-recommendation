const CENTER = 50;
const MAX_R = 45;

function angleFor(i, n) {
  return (Math.PI * 2 * i) / n - Math.PI / 2;
}

function pointAt(i, n, r) {
  const a = angleFor(i, n);
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
}

export default function SkillRadar({ owned = [], missing = [] }) {
  const ownedLower = owned.map((s) => s.toLowerCase());
  const axisSkills = [...owned, ...missing]
    .filter((v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i)
    .slice(0, 8);

  if (axisSkills.length < 3) {
    return (
      <div className="relative w-64 h-64 my-auto flex items-center justify-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center px-md">
          Data keahlian tidak cukup untuk radar chart.
        </p>
      </div>
    );
  }

  const n = axisSkills.length;
  const gridPolys = [0.33, 0.66, 1.0].map((frac, idx) => {
    const pts = axisSkills.map((_, i) => pointAt(i, n, MAX_R * frac).join(",")).join(" ");
    return <polygon key={idx} fill="none" points={pts} stroke="rgba(4,22,39,0.2)" strokeWidth="1" />;
  });

  const axesLines = axisSkills.map((_, i) => {
    const [x, y] = pointAt(i, n, MAX_R);
    return (
      <line key={i} x1={CENTER} y1={CENTER} x2={x.toFixed(2)} y2={y.toFixed(2)} stroke="rgba(4,22,39,0.2)" strokeWidth="1" />
    );
  });

  const dataPoints = axisSkills.map((skill, i) => {
    const has = ownedLower.includes(skill.toLowerCase());
    return pointAt(i, n, has ? MAX_R : MAX_R * 0.15);
  });
  const dataPolyPoints = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <div className="relative w-64 h-64 my-auto">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {gridPolys}
        {axesLines}
        <polygon fill="rgba(0,204,249,0.15)" points={dataPolyPoints} stroke="#00ccf9" strokeWidth="2" />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p[0].toFixed(2)} cy={p[1].toFixed(2)} r="2" fill="#00ccf9" />
        ))}
      </svg>
      {axisSkills.map((skill, i) => {
        const [x, y] = pointAt(i, n, MAX_R + 12);
        return (
          <span
            key={skill}
            className="absolute font-label-caps text-label-caps text-primary"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
}
