import { SUPPORTED_TAX_YEAR, TAX_RULE_2026 } from "./rules";
import type { CalculationInput, TaxBandResult, TaxCalculation } from "./types";

const ensureNonNegative = (value: number, name: string) => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a non-negative number.`);
};

export function calculateRentRelief(eligibleRent: number): number {
  ensureNonNegative(eligibleRent, "Qualifying rent");
  return Math.min(eligibleRent * TAX_RULE_2026.rentReliefRate, TAX_RULE_2026.rentReliefCap);
}

export function calculatePersonalIncomeTax(input: CalculationInput): TaxCalculation {
  if (input.taxYear !== SUPPORTED_TAX_YEAR) throw new Error("Only the 2026 tax year is supported.");
  ensureNonNegative(input.annualEmploymentIncome, "Annual employment income");
  ensureNonNegative(input.qualifyingAnnualRent, "Qualifying rent");
  ensureNonNegative(input.taxAlreadyPaid, "Tax already paid");
  ensureNonNegative(input.otherEligibleDeductions ?? 0, "Other deductions");

  const rentRelief = calculateRentRelief(input.qualifyingAnnualRent);
  const chargeableIncome = Math.max(0, input.annualEmploymentIncome - rentRelief);
  let remaining = chargeableIncome;
  const bands: TaxBandResult[] = TAX_RULE_2026.bands.map((band) => {
    const taxableAmount = Math.min(remaining, band.limit);
    const tax = taxableAmount * band.rate;
    remaining = Math.max(0, remaining - taxableAmount);
    return { label: band.label, taxableAmount, rate: band.rate, tax };
  }).filter((band) => band.taxableAmount > 0 || band.rate === 0);
  const annualTax = bands.reduce((sum, band) => sum + band.tax, 0);
  return {
    grossIncome: input.annualEmploymentIncome,
    rentRelief,
    verifiedDeductions: rentRelief,
    unverifiedDeductions: input.otherEligibleDeductions ?? 0,
    chargeableIncome,
    bands,
    annualTax,
    monthlyTax: annualTax / 12,
    taxAlreadyPaid: input.taxAlreadyPaid,
    balance: annualTax - input.taxAlreadyPaid,
  };
}
