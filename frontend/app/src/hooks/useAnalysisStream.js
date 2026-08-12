import { useCallback, useRef, useState } from "react";
import { BACKEND_URL, saveResult } from "../lib/api.js";

export const STAGES = [
  { key: "coordinator", label: "Validasi Input" },
  { key: "profiler", label: "Profiler & Market Analyst" },
  { key: "gap_analyzer", label: "Gap Analyzer" },
  { key: "strategist", label: "Strategist" },
];

function initialStageStatus() {
  const status = {};
  STAGES.forEach((s) => (status[s.key] = "pending"));
  return status;
}

/**
 * Membuka koneksi SSE ke POST /api/analyze-stream dan mengubahnya jadi state
 * React: stageStatus per-tahap, log terminal, dan error. Saat event 'done'
 * diterima, hasil disimpan ke sessionStorage dan onDone(data) dipanggil
 * (pemanggil bertanggung jawab melakukan navigasi ke halaman hasil).
 */
export function useAnalysisStream() {
  const [stageStatus, setStageStatus] = useState(initialStageStatus());
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const onDoneRef = useRef(null);

  const appendLog = useCallback((text, colorClass) => {
    setLogs((prev) => [...prev, { text, colorClass }]);
  }, []);

  const reset = useCallback(() => {
    setStageStatus(initialStageStatus());
    setLogs([]);
    setError(null);
  }, []);

  const handleSSEEvent = useCallback((rawEvent) => {
    let eventName = "message";
    let dataLine = "";
    for (const line of rawEvent.split("\n")) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
    }
    if (!dataLine) return;

    let data;
    try {
      data = JSON.parse(dataLine);
    } catch (e) {
      return;
    }

    if (eventName === "progress") {
      const key =
        STAGES.find((s) => s.key === data.stage || s.label === data.stage)?.key ||
        (data.node === "profiler" || data.node === "analyst" ? "profiler" : data.node);
      setStageStatus((prev) => {
        if (prev[key] === undefined) return prev;
        return { ...prev, [key]: data.status === "done" ? "done" : "started" };
      });
      appendLog(`[${data.stage}] ${data.message || data.status}`, "text-secondary-fixed");
    } else if (eventName === "error") {
      setError(data.message || "Terjadi kesalahan pada server.");
      appendLog("[ERROR] " + (data.message || "Terjadi kesalahan pada server."), "text-error");
    } else if (eventName === "done") {
      setStageStatus(() => {
        const done = {};
        STAGES.forEach((s) => (done[s.key] = "done"));
        return done;
      });
      appendLog("Analisis selesai. Mengalihkan ke halaman hasil...", "text-secondary-fixed");
      saveResult(data);
      onDoneRef.current?.(data);
    }
  }, [appendLog]);

  const start = useCallback(
    async (formData, { onDone } = {}) => {
      reset();
      onDoneRef.current = onDone || null;
      appendLog("Menghubungkan ke server...", "text-outline");

      try {
        const response = await fetch(`${BACKEND_URL}/api/analyze-stream`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok || !response.body) {
          const text = await response.text().catch(() => "");
          throw new Error(text || `Server merespons dengan status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let boundary;
          while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            handleSSEEvent(rawEvent);
          }
        }
      } catch (err) {
        setError(err.message || "Terjadi kesalahan tak terduga.");
        appendLog("[ERROR] " + (err.message || "Terjadi kesalahan tak terduga."), "text-error");
      }
    },
    [appendLog, handleSSEEvent, reset]
  );

  return { stageStatus, logs, error, start, reset };
}
