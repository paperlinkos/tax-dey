import type { SavingsGoal } from "./types";
const KEY = "tax-de-save-v1";
export const loadGoals = (): SavingsGoal[] => { try { const data = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(data) ? data : []; } catch { return []; } };
export const saveGoals = (goals: SavingsGoal[]) => localStorage.setItem(KEY, JSON.stringify(goals));
