export type TaxYear = 2026;

export type TaxBandResult = {
  label: string;
  taxableAmount: number;
  rate: number;
  tax: number;
};

export type CalculationInput = {
  taxYear: number;
  annualEmploymentIncome: number;
  qualifyingAnnualRent: number;
  /** Informational only until eligibility has legal review; excluded from tax relief. */
  otherEligibleDeductions?: number;
  taxAlreadyPaid: number;
};

export type TaxCalculation = {
  grossIncome: number;
  rentRelief: number;
  verifiedDeductions: number;
  unverifiedDeductions: number;
  chargeableIncome: number;
  bands: TaxBandResult[];
  annualTax: number;
  monthlyTax: number;
  taxAlreadyPaid: number;
  balance: number;
};
