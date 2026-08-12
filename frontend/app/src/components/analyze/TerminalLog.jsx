import { useEffect, useRef } from "react";

export default function TerminalLog({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-card rounded-xl flex flex-col overflow-hidden bg-primary text-surface-bright font-mono h-[360px]">
      <div className="bg-primary-container p-sm border-b border-outline/30 flex justify-between items-center">
        <span className="font-label-caps text-label-caps text-secondary-fixed">Agent Execution Log</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-error"></div>
          <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
          <div className="w-2 h-2 rounded-full bg-secondary-fixed"></div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="p-sm flex-grow overflow-y-auto terminal-scroll font-body-sm text-body-sm leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-outline">Menunggu koneksi ke server...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={log.colorClass || ""}>{log.text}</div>
          ))
        )}
      </div>
    </div>
  );
}
