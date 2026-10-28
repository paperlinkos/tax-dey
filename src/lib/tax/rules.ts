import type { TaxYear } from "./types";

export const SUPPORTED_TAX_YEAR: TaxYear = 2026;

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
