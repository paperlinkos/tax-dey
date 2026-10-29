import type { TaxYear } from "./types";

export const SUPPORTED_TAX_YEAR: TaxYear = 2026;

/**
 * Every rule carries its source and review status so a lawyer or tax adviser can
 * sign off (or change) a single value without touching calculation code.
 * "needs-legal-review" means sources disagree or we inferred something; the app
 * still uses the conservative value so users never under-save.
 */
export type RuleReview = {
  legalSource: string;
  reference: string;
  verificationStatus: "implemented" | "needs-legal-review";
  note?: string;
};

export const TAX_RULE_2026 = {
  taxYear: 2026 as TaxYear,
  effectiveDate: "2026-01-01",
  legalSource: "Nigeria Tax Act, 2025",
  reference: "Personal income tax rate schedule; rent relief provisions",
  verificationStatus: "Verified against milestone-supplied statutory schedule; legal review recommended before filing.",
  rentReliefRate: 0.2,
  rentReliefCap: 500_000,
  bands: [
    { limit: 800_000, rate: 0, label: "First ₦800,000" },
    { limit: 2_200_000, rate: 0.15, label: "Next ₦2,200,000" },
    { limit: 9_000_000, rate: 0.18, label: "Next ₦9,000,000" },
    { limit: 13_000_000, rate: 0.21, label: "Next ₦13,000,000" },
    { limit: 25_000_000, rate: 0.23, label: "Next ₦25,000,000" },
    { limit: Infinity, rate: 0.25, label: "Above ₦50,000,000" },
  ],
} as const;

export const COMPANY_RULE_2026 = {
  taxYear: 2026 as TaxYear,
  citRate: 0.3,
  smallCompanyCitRate: 0,
  developmentLevyRate: 0.04,
  // Sources conflict: the Act text quoted by some firms says ₦50m, other summaries say ₦100m.
  // We use the lower figure so companies near the line save more, not less.
  smallCompanyTurnoverLimit: 50_000_000,
  smallCompanyFixedAssetLimit: 250_000_000,
  professionalServicesExcludedFromSmall: true,
  minimumEffectiveRate: 0.15,
  minimumEffectiveRateTurnover: 50_000_000_000,
  review: {
    legalSource: "Nigeria Tax Act, 2025",
    reference: "Companies income tax rates (s.56), development levy (s.59), minimum effective tax rate, small company definition",
    verificationStatus: "needs-legal-review",
    note: "Confirm the small company turnover threshold (₦50m vs ₦100m) and whether a presidential order has reduced CIT to 25%.",
  } satisfies RuleReview,
} as const;

export const PRESUMPTIVE_RULE_2026 = {
  taxYear: 2026 as TaxYear,
  turnoverRate: 0.01,
  nanoExemptionTurnover: 12_000_000,
  review: {
    legalSource: "Presumptive Tax Regulations, 2026 (signed 4 March 2026, under s.29 Nigeria Tax Act)",
    reference: "1% of actual or estimated turnover; nano businesses (≤ ₦12m turnover, no fixed premises, no employees) exempt",
    verificationStatus: "needs-legal-review",
    note: "Applies where records are not kept. The separate 2% charge on gross consideration is not modelled yet.",
  } satisfies RuleReview,
} as const;

export const VAT_RULE_2026 = {
  taxYear: 2026 as TaxYear,
  rate: 0.075,
  review: {
    legalSource: "Nigeria Tax Act, 2025",
    reference: "Value added tax at 7.5%",
    verificationStatus: "needs-legal-review",
    note: "Only applied when the user says they charge VAT. Registration threshold and exempt supplies are not checked.",
  } satisfies RuleReview,
} as const;

export const ALL_RULE_REVIEWS: { name: string; review: RuleReview }[] = [
  { name: "Personal income tax bands and rent relief", review: { legalSource: TAX_RULE_2026.legalSource, reference: TAX_RULE_2026.reference, verificationStatus: "implemented" } },
  { name: "Company income tax and development levy", review: COMPANY_RULE_2026.review },
  { name: "Presumptive tax for informal businesses", review: PRESUMPTIVE_RULE_2026.review },
  { name: "Value added tax", review: VAT_RULE_2026.review },
];
