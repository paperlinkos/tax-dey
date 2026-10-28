import { describe, expect, it } from "vitest";
import { incomeSuggestion, plan } from "./calculator";
import type { SavingsGoal } from "./types";
const goal = (): SavingsGoal => ({ id: "a", name: "Tax", target: 120_000, targetDate: "2027-01-01", frequency: "monthly", contributions: [], provisional: false, revisions: [] });
describe("savings planner", () => { it("calculates monthly plan", () => expect(plan(goal(), new Date("2026-01-01")).suggested).toBe(10_000)); it("handles overfunding", () => { const value = goal(); value.contributions = [{ id:"1", amount: 200_000, date:"2026-01-01", selfReported:true }]; expect(plan(value).remaining).toBe(0); }); it("handles past dates", () => expect(plan(goal(), new Date("2028-01-01")).pastDue).toBe(true)); it("suggests a percentage of income", () => expect(incomeSuggestion(100_000, { percentage: 10 })).toBe(10_000)); });
