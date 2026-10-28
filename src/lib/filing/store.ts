import type { StoredAssessment } from "./types";
export const ASSESSMENT_KEY = "tax-de-assessment-v1";
export function saveAssessment(assessment: StoredAssessment) { window.localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(assessment)); }
export function loadAssessment(): StoredAssessment | null { try { const raw = window.localStorage.getItem(ASSESSMENT_KEY); if (!raw) return null; const value = JSON.parse(raw) as StoredAssessment; return value?.version === 1 && typeof value.category === "string" ? value : null; } catch { return null; } }
export function clearAssessment() { window.localStorage.removeItem(ASSESSMENT_KEY); }
