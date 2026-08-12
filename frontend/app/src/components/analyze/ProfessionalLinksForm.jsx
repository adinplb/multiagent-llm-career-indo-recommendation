export default function ProfessionalLinksForm({ githubUrl, onGithubUrlChange }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-sm">
        <span className="material-symbols-outlined text-primary">link</span>
        Professional Footprint
      </h2>
      <div className="flex flex-col gap-xs max-w-md">
        <label className="font-body-sm text-body-sm font-semibold text-on-surface" htmlFor="github-url">
          GitHub / Portfolio URL
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant">code</span>
          <input
            id="github-url"
            type="url"
            placeholder="https://github.com/..."
            className="pl-xl pr-sm py-sm w-full border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-fixed shadow-sm"
            value={githubUrl}
            onChange={(e) => onGithubUrlChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
