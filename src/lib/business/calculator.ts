import { calculatePersonalIncomeTax } from "@/lib/tax/calculator";
import type { BusinessAssessmentInput, BusinessAssessmentResult, LegalSourceReference } from "./types";

const nonNegative = (amount: number, label: string) => { if (!Number.isSafeInteger(amount) || amount < 0) throw new Error(`${label} must be a whole, non-negative naira amount.`); };

export const BUSINESS_LEGAL_REFERENCES: LegalSourceReference[] = [
  { source: "Nigeria Tax Act, 2025", topic: "Business deductions, assessable profits, total income and chargeable income", status: "review-required" },
  { source: "Nigeria Tax Act, 2025", topic: "2026 personal income tax rate schedule", status: "implemented" },
];

export function annualiseRevenue(revenue: number, period: "monthly" | "yearly"): number { nonNegative(revenue, "Business revenue"); return period === "monthly" ? revenue * 12 : revenue; }

export function calculateBusinessAssessment(input: BusinessAssessmentInput): BusinessAssessmentResult {
  nonNegative(input.businessIncome.revenue, "Business revenue"); nonNegative(input.businessIncome.otherIncome, "Other income"); nonNegative(input.personal.annualSalary, "Salary"); nonNegative(input.personal.qualifyingAnnualRent, "Personal rent");
  input.expenses.forEach((expense) => nonNegative(expense.amount, "Expense")); input.payments.forEach((payment) => nonNegative(payment.amount, "Tax payment"));
  const annualBusinessRevenue = annualiseRevenue(input.businessIncome.revenue, input.businessIncome.period);
  const reportedExpenses = input.expenses.reduce((sum, item) => sum + item.amount, 0);
  const verifiedDeductibleExpenses = input.expenses.filter((item) => item.verification === "verified").reduce((sum, item) => sum + item.amount, 0);
  const excludedExpenses = reportedExpenses - verifiedDeductibleExpenses;
  const estimatedBusinessProfit = Math.max(0, annualBusinessRevenue - verifiedDeductibleExpenses);
  const reasons: string[] = []; const missing: string[] = [];
  if (!input.profile.workDescription.trim()) missing.push("a description of your work or business");
  if (!input.businessIncome.hasRecords) reasons.push("You said you do not have sales or payment records.");
  if (input.profile.operatingThroughCompany) reasons.push("Company tax is outside this personal-income estimate.");
  if (input.expenses.some((item) => item.verification === "requires-review" || item.verification === "capital")) reasons.push("Some expenses need statutory treatment or capital-allowance review.");
  const withholdingUnsupported = input.payments.some((payment) => payment.type === "withholding" && !payment.supportedByRecords);
  if (withholdingUnsupported) reasons.push("A withholding-tax entry does not have supporting records.");
  const status = missing.length ? "incomplete" : reasons.length ? "professional-review-required" : "estimate-available";
  const assessableBusinessIncome = estimatedBusinessProfit + input.businessIncome.otherIncome;
  const eligibleCredits = input.payments.filter((payment) => payment.type !== "withholding" || payment.supportedByRecords).reduce((sum, payment) => sum + payment.amount, 0);
  const personalTax = status === "estimate-available" ? calculatePersonalIncomeTax({ taxYear: input.taxYear, annualEmploymentIncome: input.personal.annualSalary + assessableBusinessIncome, qualifyingAnnualRent: input.personal.qualifyingAnnualRent, taxAlreadyPaid: eligibleCredits }) : null;
  return { completeness: { status, reasons, missing }, annualBusinessRevenue, reportedExpenses, verifiedDeductibleExpenses, excludedExpenses, estimatedBusinessProfit, assessableBusinessIncome, otherTaxableIncome: input.personal.annualSalary + input.businessIncome.otherIncome, eligibleCredits, personalTax };
}
