import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import CvDropzone from "../components/analyze/CvDropzone.jsx";
import TargetPositionForm, { EXPERIENCE_LEVELS } from "../components/analyze/TargetPositionForm.jsx";
import ProfessionalLinksForm from "../components/analyze/ProfessionalLinksForm.jsx";
import ProcessingPanel from "../components/analyze/ProcessingPanel.jsx";
import { useAnalysisStream } from "../hooks/useAnalysisStream.js";
import { getClientId } from "../lib/clientId.js";

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [view, setView] = useState("form"); // 'form' | 'processing'
  const [cvFile, setCvFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [formError, setFormError] = useState("");

  const { stageStatus, logs, error, start } = useAnalysisStream();

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!cvFile) {
      setFormError("Silakan unggah CV dalam format PDF terlebih dahulu.");
      return;
    }
    if (!targetRole.trim()) {
      setFormError("Silakan isi posisi/role yang dituju.");
      return;
    }

    const levelLabel = EXPERIENCE_LEVELS.find((l) => l.value === experienceLevel)?.label;
    const additionalContext = levelLabel
      ? `Target level: ${levelLabel}. ${contextNotes.trim()}`.trim()
      : contextNotes.trim();

    const formData = new FormData();
    formData.append("cv_file", cvFile);
    formData.append("target_role", targetRole.trim());
    formData.append("user_name", "");
    formData.append("github_url", githubUrl.trim());
    formData.append("additional_context", additionalContext);
    formData.append("client_id", getClientId());

    setView("processing");
    start(formData, { onDone: () => setTimeout(() => navigate("/result"), 600) });
  }

  function handleRetry() {
    setView("form");
  }

  return (
    <div className="bg-surface-bright text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <div className="flex-1 flex w-full">
        <DashboardSidebar />

        <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-lg py-xl">
          {view === "form" ? (
            <div>
              <div className="mb-xl">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-base">Career Analysis Initialization</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Provide your professional details to generate a comprehensive SKKNI-aligned career path.</p>
              </div>

              <div className="mb-xl flex items-center w-full">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-caps font-bold z-10 shrink-0 shadow-sm border border-secondary-container">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  <span className="ml-sm font-label-caps text-label-caps text-on-surface">Consent</span>
                </div>
                <div className="flex-1 h-px bg-secondary-container mx-sm"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps font-bold z-10 shrink-0 shadow-md ring-4 ring-primary-fixed">2</div>
                  <span className="ml-sm font-label-caps text-label-caps text-on-surface font-bold">Input</span>
                </div>
                <div className="flex-1 h-px bg-outline-variant mx-sm"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant flex items-center justify-center font-label-caps font-bold z-10 shrink-0">3</div>
                  <span className="ml-sm font-label-caps text-label-caps text-on-surface-variant">Analysis</span>
                </div>
                <div className="flex-1 h-px bg-outline-variant mx-sm"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant flex items-center justify-center font-label-caps font-bold z-10 shrink-0">4</div>
                  <span className="ml-sm font-label-caps text-label-caps text-on-surface-variant">Result</span>
                </div>
              </div>

              {formError && (
                <p className="bg-error-container text-on-error-container px-md py-sm rounded-lg font-body-sm text-body-sm mb-md">{formError}</p>
              )}

              <form className="flex flex-col gap-xl pb-xl" onSubmit={handleSubmit}>
                <CvDropzone file={cvFile} onFileChange={setCvFile} />
                <TargetPositionForm
                  targetRole={targetRole}
                  onTargetRoleChange={setTargetRole}
                  experienceLevel={experienceLevel}
                  onExperienceLevelChange={setExperienceLevel}
                />
                <ProfessionalLinksForm githubUrl={githubUrl} onGithubUrlChange={setGithubUrl} />

                <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                  <div className="flex justify-between items-start mb-md">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">edit_note</span>
                      Additional Context
                    </h2>
                    <span className="bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps px-sm py-xs rounded-full flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Enhanced
                    </span>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="context-notes">
                      Provide any specific goals, constraints, or recent certifications not included in your CV that the AI should consider during SKKNI mapping.
                    </label>
                    <textarea
                      id="context-notes"
                      rows="4"
                      placeholder="I am particularly interested in focusing on data governance and recently completed an online course in big data architecture..."
                      className="px-md py-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-secondary-container focus:ring-2 focus:ring-secondary-fixed shadow-sm resize-y"
                      value={contextNotes}
                      onChange={(e) => setContextNotes(e.target.value)}
                    ></textarea>
                  </div>
                </section>

                <div className="flex justify-end gap-md pt-md border-t border-outline-variant mt-sm">
                  <button
                    type="submit"
                    className="bg-secondary-container text-on-secondary-container px-lg py-sm rounded-lg font-body-md text-body-md font-bold flex items-center gap-sm hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <span className="material-symbols-outlined">magic_button</span>
                    Initialize Analysis
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <ProcessingPanel stageStatus={stageStatus} logs={logs} error={error} onRetry={handleRetry} />
          )}
        </main>
      </div>

      <footer className="bg-surface-container w-full border-t border-outline-variant mt-auto">
        <div className="w-full py-md px-lg flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-md">
          <div className="font-headline-sm text-headline-sm font-semibold text-primary">Cerah AI</div>
          <div className="font-body-sm text-body-sm text-on-surface">© 2024 Cerah AI. Powered by SKKNI Standards.</div>
          <nav className="flex flex-wrap gap-md justify-center">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Institutional Partners</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Contact Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
