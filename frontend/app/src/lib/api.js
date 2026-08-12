import { getClientId } from "./clientId.js";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const RESULT_STORAGE_KEY = "careerAnalysisResult";

export function saveResult(data) {
  sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
}

export function loadResult() {
  const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearResult() {
  sessionStorage.removeItem(RESULT_STORAGE_KEY);
}

async function parseJsonOrThrow(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Server merespons dengan status ${response.status}`);
  }
  return response.json();
}

export async function fetchHistory() {
  const clientId = getClientId();
  const response = await fetch(`${BACKEND_URL}/api/history?client_id=${clientId}`);
  return parseJsonOrThrow(response);
}

export async function fetchHistoryDetail(id) {
  const clientId = getClientId();
  const response = await fetch(`${BACKEND_URL}/api/history/${id}?client_id=${clientId}`);
  return parseJsonOrThrow(response);
}

export async function deleteHistoryItem(id) {
  const clientId = getClientId();
  const response = await fetch(`${BACKEND_URL}/api/history/${id}?client_id=${clientId}`, {
    method: "DELETE",
  });
  return parseJsonOrThrow(response);
}

export async function deleteAllHistory() {
  const clientId = getClientId();
  const response = await fetch(`${BACKEND_URL}/api/history?client_id=${clientId}`, {
    method: "DELETE",
  });
  return parseJsonOrThrow(response);
}
