import { COMPANY_RULE_2026 } from "./rules";

export type CompanyTaxInput = {
  annualTurnover: number;
  totalFixedAssets: number;
  assessableProfit: number;
  providesProfessionalServices: boolean;
};

export type CompanyTaxResult = {
  smallCompany: boolean;
  citRate: number;
  companyIncomeTax: number;
  developmentLevy: number;
  totalTax: number;
  reviewFlags: string[];
};

const ensureNonNegative = (value: number, name: string) => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a non-negative number.`);
};

export function isSmallCompany(input: Pick<CompanyTaxInput, "annualTurnover" | "totalFixedAssets" | "providesProfessionalServices">): boolean {
  if (COMPANY_RULE_2026.professionalServicesExcludedFromSmall && input.providesProfessionalServices) return false;
  return input.annualTurnover <= COMPANY_RULE_2026.smallCompanyTurnoverLimit && input.totalFixedAssets <= COMPANY_RULE_2026.smallCompanyFixedAssetLimit;
}

export function calculateCompanyTax(input: CompanyTaxInput): CompanyTaxResult {
  ensureNonNegative(input.annualTurnover, "Annual turnover");
  ensureNonNegative(input.totalFixedAssets, "Fixed assets");
  ensureNonNegative(input.assessableProfit, "Assessable profit");

  const smallCompany = isSmallCompany(input);
  const citRate = smallCompany ? COMPANY_RULE_2026.smallCompanyCitRate : COMPANY_RULE_2026.citRate;
  const companyIncomeTax = input.assessableProfit * citRate;
  const developmentLevy = smallCompany ? 0 : input.assessableProfit * COMPANY_RULE_2026.developmentLevyRate;

  const reviewFlags: string[] = [];
  if (input.annualTurnover >= COMPANY_RULE_2026.minimumEffectiveRateTurnover) {
    reviewFlags.push("Turnover is at or above ₦50bn, so the 15% minimum effective tax rate may apply. Get professional advice.");
  }
  if (smallCompany) {
    reviewFlags.push("Small company status depends on a threshold that is still being confirmed. Keep records of turnover and fixed assets.");
  }

  return { smallCompany, citRate, companyIncomeTax, developmentLevy, totalTax: companyIncomeTax + developmentLevy, reviewFlags };
}
