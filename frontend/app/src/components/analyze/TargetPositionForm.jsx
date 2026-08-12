const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (Junior)" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead / Managerial" },
];

export default function TargetPositionForm({ targetRole, onTargetRoleChange, experienceLevel, onExperienceLevelChange }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-sm">
        <span className="material-symbols-outlined text-primary">track_changes</span>
        Target Position
      </h2>
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label className="font-body-sm text-body-sm font-semibold text-on-surface" htmlFor="target-role">
            Desired Role / SKKNI Scheme
          </label>
          <input
            id="target-role"
            type="text"
            placeholder="e.g. Senior Data Analyst or Data Scientist"
            className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-fixed shadow-sm"
            value={targetRole}
            onChange={(e) => onTargetRoleChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-body-sm text-body-sm font-semibold text-on-surface" htmlFor="experience-level">
            Target Experience Level
          </label>
          <select
            id="experience-level"
            className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-fixed shadow-sm appearance-none bg-white"
            value={experienceLevel}
            onChange={(e) => onExperienceLevelChange(e.target.value)}
          >
            <option value="">Select level...</option>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

export { EXPERIENCE_LEVELS };
