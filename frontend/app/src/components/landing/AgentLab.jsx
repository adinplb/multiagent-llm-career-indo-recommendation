export default function AgentLab() {
  return (
    <section className="px-md md:px-xl max-w-container-max mx-auto mb-xl scroll-mt-24">
      <div className="text-center mb-lg">
        <h2 className="font-headline-md text-headline-md md:font-display-lg-mobile md:text-display-lg-mobile text-primary mb-xs">Real-time Agent Lab</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Live execution pipeline for personalized career mapping.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-12 glass-panel rounded-xl p-md">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-sm flex items-center gap-base">
            <span className="material-symbols-outlined text-secondary-container">route</span>
            Pipeline Progress
          </h2>
          <div className="relative w-full bg-surface-variant rounded-full h-4 mb-sm overflow-hidden border border-outline-variant/30">
            <div className="progress-bar-fill h-4 rounded-full" style={{ width: "65%" }}></div>
          </div>
          <div className="flex justify-between text-body-sm font-body-sm text-on-surface-variant">
            <span className="flex items-center gap-xs text-primary font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span> Market Research
            </span>
            <span className="flex items-center gap-xs text-secondary-container font-bold">
              <span className="material-symbols-outlined text-sm animate-spin">autorenew</span> Skill Gap Analysis
            </span>
            <span className="flex items-center gap-xs text-outline">
              <span className="material-symbols-outlined text-sm">schedule</span> Roadmap Generation
            </span>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-gutter">
          <div className="glass-panel rounded-xl p-md flex-grow">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md flex items-center gap-base">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              Active Agents
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="flex items-center gap-sm p-sm rounded-lg bg-surface border border-outline-variant/30 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <div className="flex-grow">
                  <p className="font-label-caps text-label-caps text-primary">AGENT-1</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Research Agent</p>
                </div>
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
              </div>
              <div className="flex items-center gap-sm p-sm rounded-lg bg-surface border border-secondary-container shadow-[0_0_10px_rgba(0,204,249,0.1)] relative overflow-hidden pulse-active">
                <div className="absolute inset-0 bg-secondary-container/5"></div>
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-primary relative z-10">
                  <span className="material-symbols-outlined">account_tree</span>
                </div>
                <div className="flex-grow relative z-10">
                  <p className="font-label-caps text-label-caps text-primary">AGENT-2</p>
                  <p className="font-body-sm text-body-sm text-secondary">SKKNI Mapping Agent</p>
                </div>
                <span className="relative flex h-2 w-2 z-10">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
                </span>
              </div>
              <div className="flex items-center gap-sm p-sm rounded-lg bg-surface border border-outline-variant/30 opacity-60">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div className="flex-grow">
                  <p className="font-label-caps text-label-caps text-outline">AGENT-3</p>
                  <p className="font-body-sm text-body-sm text-outline">Gap Analyst Agent</p>
                </div>
                <span className="material-symbols-outlined text-outline text-sm">schedule</span>
              </div>
              <div className="flex items-center gap-sm p-sm rounded-lg bg-surface border border-outline-variant/30 opacity-60">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div className="flex-grow">
                  <p className="font-label-caps text-label-caps text-outline">AGENT-4</p>
                  <p className="font-body-sm text-body-sm text-outline">Career Advisor Agent</p>
                </div>
                <span className="material-symbols-outlined text-outline text-sm">schedule</span>
              </div>
              <div className="flex items-center gap-sm p-sm rounded-lg bg-surface border border-outline-variant/30 opacity-60">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex-grow">
                  <p className="font-label-caps text-label-caps text-outline">AGENT-5</p>
                  <p className="font-body-sm text-body-sm text-outline">Resume Optimizer Agent</p>
                </div>
                <span className="material-symbols-outlined text-outline text-sm">schedule</span>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-md flex items-center justify-between">
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Estimated Time</p>
              <p className="font-headline-md text-headline-md text-primary">02:45</p>
            </div>
            <button className="bg-error/10 text-error px-sm py-xs rounded hover:bg-error/20 transition-colors font-body-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">stop_circle</span> Abort
            </button>
          </div>
        </div>

        <div className="md:col-span-8 glass-panel rounded-xl flex flex-col overflow-hidden border border-outline-variant/30">
          <div className="bg-primary px-md py-sm border-b border-primary-container flex justify-between items-center">
            <h3 className="font-body-md text-body-md text-on-primary font-bold flex items-center gap-base">
              <span className="material-symbols-outlined text-secondary-fixed-dim text-sm">terminal</span>
              Execution Log
            </h3>
            <div className="flex gap-xs">
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
            </div>
          </div>
          <div className="bg-tertiary flex-grow p-md font-mono text-body-sm h-[400px] overflow-y-auto terminal-scroll relative">
            <div className="flex flex-col gap-xs text-on-tertiary-fixed-variant">
              <div className="text-tertiary-fixed-dim">[10:42:01] <span className="text-secondary-fixed-dim">System:</span> Initializing Cerah AI Pipeline...</div>
              <div className="text-tertiary-fixed-dim">[10:42:05] <span className="text-inverse-primary">Research Agent:</span> Analyzing job market trends for 'Data Scientist'...</div>
              <div className="text-tertiary-fixed-dim">[10:42:12] <span className="text-inverse-primary">Research Agent:</span> Fetching real-time vacancies from LinkedIn &amp; Tech in Asia.</div>
              <div className="text-tertiary-fixed-dim">[10:42:20] <span className="text-secondary-fixed-dim">System:</span> Market data retrieved. Activating SKKNI Mapping Agent.</div>
              <div className="text-tertiary-fixed-dim">[10:42:22] <span className="text-secondary-container">SKKNI Mapping Agent:</span> Mapping skills to SKKNI codes (Bidang Informatika).</div>
              <div className="text-tertiary-fixed-dim">[10:42:30] <span className="text-secondary-container animate-pulse">SKKNI Mapping Agent:</span> Validating competency standards for INF.TI01.001.01... <span className="text-secondary-fixed-dim">_</span></div>
              <div className="text-tertiary-fixed-dim opacity-60">[Pending] <span className="text-outline">Gap Analyst Agent:</span> Waiting for competency mapping...</div>
              <div className="text-tertiary-fixed-dim opacity-60">[Pending] <span className="text-outline">Career Advisor Agent:</span> Waiting for gap analysis...</div>
              <div className="text-tertiary-fixed-dim opacity-60">[Pending] <span className="text-outline">Resume Optimizer Agent:</span> Waiting for roadmap generation...</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
