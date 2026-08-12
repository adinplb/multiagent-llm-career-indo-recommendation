import StageProgress from "./StageProgress.jsx";
import TerminalLog from "./TerminalLog.jsx";

export default function ProcessingPanel({ stageStatus, logs, error, onRetry }) {
  return (
    <div className="flex flex-col gap-xl">
      <header className="flex flex-col gap-sm mb-md">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">AI Agents Processing</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Agen AI kami sedang menganalisis profil Anda terhadap standar SKKNI untuk menyusun jalur karier optimal.
        </p>
      </header>
      <StageProgress stageStatus={stageStatus} />
      <TerminalLog logs={logs} />
      {error && (
        <div className="bg-error-container text-on-error-container px-md py-md rounded-lg font-body-sm text-body-sm flex items-center justify-between gap-md">
          <span>{error}</span>
          <button
            onClick={onRetry}
            className="bg-error text-on-error px-md py-xs rounded-lg font-body-sm font-semibold whitespace-nowrap"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}
