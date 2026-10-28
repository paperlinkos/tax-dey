export type Frequency = "weekly" | "monthly";
export type Contribution = { id: string; amount: number; date: string; note?: string; providerLabel?: string; selfReported: true };
export type SavingsGoal = { id: string; name: string; target: number; targetDate: string; frequency: Frequency; preferredAmount?: number; linkedAssessment?: { tax: number; year: number; status: "estimate-available" | "professional-review-required" }; provisional: boolean; contributions: Contribution[]; revisions: { previous: number; next: number; at: string }[] };
export type ProviderCapability = "accountLinking" | "onboarding" | "goalSupport" | "balance" | "transactions" | "scheduledContributions" | "withdrawals" | "webhooks";
export type Provider = { id: string; name: string; capabilities: Record<ProviderCapability, "unsupported" | "awaiting-verification"> };
