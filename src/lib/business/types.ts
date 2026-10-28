import type { CalculationInput, TaxCalculation } from "@/lib/tax/types";

export type TaxpayerKind = "freelancer" | "trader" | "registered-business";
export type ExpenseCategory = "stock" | "premises-rent" | "utilities" | "internet-phone" | "wages" | "transport" | "professional-fees" | "other" | "personal" | "capital";
export type ExpenseVerification = "verified" | "requires-review" | "personal" | "capital";
export type PaymentType = "paye" | "withholding" | "other-verified";
export type AssessmentStatus = "estimate-available" | "incomplete" | "professional-review-required";

export type BusinessExpense = { category: ExpenseCategory; amount: number; verification: ExpenseVerification };
export type TaxPayment = { type: PaymentType; amount: number; supportedByRecords: boolean };
export type BusinessAssessmentInput = {
  taxYear: number;
  profile: { taxpayerKind: TaxpayerKind; workDescription: string; isRegistered: boolean; operatingThroughCompany: boolean; hasSalary: boolean };
  businessIncome: { revenue: number; period: "monthly" | "yearly"; hasRecords: boolean; otherIncome: number };
  expenses: BusinessExpense[];
  personal: { annualSalary: number; qualifyingAnnualRent: number };
  payments: TaxPayment[];
};
export type AssessmentCompleteness = { status: AssessmentStatus; reasons: string[]; missing: string[] };
export type BusinessAssessmentResult = {
  completeness: AssessmentCompleteness;
  annualBusinessRevenue: number;
  reportedExpenses: number;
  verifiedDeductibleExpenses: number;
  excludedExpenses: number;
  estimatedBusinessProfit: number;
  assessableBusinessIncome: number;
  otherTaxableIncome: number;
  eligibleCredits: number;
  personalTax: TaxCalculation | null;
};

export type LegalSourceReference = { source: string; topic: string; status: "implemented" | "review-required" };
