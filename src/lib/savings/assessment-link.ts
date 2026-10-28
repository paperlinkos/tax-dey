import type { StoredAssessment } from "@/lib/filing/types";
import type { SavingsGoal } from "./types";

export function goalFromAssessment(assessment: StoredAssessment, targetDate: string, frequency: "weekly" | "monthly"): SavingsGoal {
  const supported = assessment.calculationStatus === "estimate-available" && assessment.tax !== null;
  return { id: crypto.randomUUID(), name: supported ? `Tax estimate ${assessment.createdAt.slice(0,4)}` : "Provisional tax savings", target: supported ? assessment.tax! : 0, targetDate, frequency, provisional: !supported, linkedAssessment: assessment.tax === null ? undefined : { tax: assessment.tax, year: Number(assessment.createdAt.slice(0,4)), status: assessment.calculationStatus }, contributions: [], revisions: [] };
}
export function taxEstimateChanged(goal: SavingsGoal, newEstimate: number) { return goal.linkedAssessment ? { previous: goal.linkedAssessment.tax, next: newEstimate, changed: goal.linkedAssessment.tax !== newEstimate } : null; }
