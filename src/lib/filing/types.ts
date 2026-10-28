export type StoredAssessment = { version: 1; category: "salary" | "freelancer" | "trader" | "registered-business"; createdAt: string; calculationStatus: "estimate-available" | "professional-review-required"; grossIncome: number; businessExpenses?: number; deductions: number; chargeableIncome?: number; tax: number | null; credits: number; balance: number | null; flags: string[]; language: "en" | "pcm" };
export type ChecklistItem = { id: string; required: boolean; title: string; reason: string; source: string };
export type FilingReadiness = "ready" | "missing" | "review";
