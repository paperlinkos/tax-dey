export type Segment = "salary" | "freelancer" | "trader" | "company";

/**
 * What we need to know to split a payment into "yours" and "tax".
 * Fields that don't apply to a segment are ignored by the engine.
 */
export type TaxProfile = {
  segment: Segment;
  /** Salary earners: is PAYE already deducted by your employer? If so, logged income is extra income on top of salary. */
  payeHandledByEmployer: boolean;
  /** Annual salary already taxed through PAYE (salary earners and freelancers with a day job). */
  annualSalary: number;
  qualifyingAnnualRent: number;
  /** Freelancers, traders with records, companies: share of each receipt that is profit (0–1). */
  profitMargin: number;
  /** Traders: do you keep sales and expense records? If not, the presumptive regime applies. */
  keepsRecords: boolean;
  /** Traders and companies: what you expect to take in this year, used to decide exemptions. */
  expectedAnnualTurnover: number;
  hasFixedPremises: boolean;
  hasEmployees: boolean;
  /** Companies only. */
  totalFixedAssets: number;
  providesProfessionalServices: boolean;
  chargesVat: boolean;
  /** Extra cushion on top of the estimate (0–0.25), so the vault errs on the side of too much. */
  bufferRate: number;
};

export type SetAsideLineKind = "income-tax" | "presumptive-tax" | "company-tax" | "development-levy" | "vat" | "buffer";

export type SetAsideLine = { kind: SetAsideLineKind; label: string; amount: number };

export type SetAsideResult = {
  /** Whole naira to move into the vault, rounded up. */
  total: number;
  lines: SetAsideLine[];
  /** Share of the payment going to the vault, for display ("13.1%"). */
  effectiveRate: number;
  explanation: string;
  reviewFlags: string[];
};

export const DEFAULT_PROFILE: Record<Segment, TaxProfile> = {
  salary: { segment: "salary", payeHandledByEmployer: true, annualSalary: 0, qualifyingAnnualRent: 0, profitMargin: 1, keepsRecords: true, expectedAnnualTurnover: 0, hasFixedPremises: false, hasEmployees: false, totalFixedAssets: 0, providesProfessionalServices: false, chargesVat: false, bufferRate: 0 },
  freelancer: { segment: "freelancer", payeHandledByEmployer: true, annualSalary: 0, qualifyingAnnualRent: 0, profitMargin: 0.8, keepsRecords: true, expectedAnnualTurnover: 0, hasFixedPremises: false, hasEmployees: false, totalFixedAssets: 0, providesProfessionalServices: true, chargesVat: false, bufferRate: 0.05 },
  trader: { segment: "trader", payeHandledByEmployer: true, annualSalary: 0, qualifyingAnnualRent: 0, profitMargin: 0.25, keepsRecords: false, expectedAnnualTurnover: 6_000_000, hasFixedPremises: true, hasEmployees: false, totalFixedAssets: 0, providesProfessionalServices: false, chargesVat: false, bufferRate: 0.05 },
  company: { segment: "company", payeHandledByEmployer: true, annualSalary: 0, qualifyingAnnualRent: 0, profitMargin: 0.2, keepsRecords: true, expectedAnnualTurnover: 200_000_000, hasFixedPremises: true, hasEmployees: true, totalFixedAssets: 20_000_000, providesProfessionalServices: false, chargesVat: true, bufferRate: 0 },
};

export const SEGMENT_LABELS: Record<Segment, { title: string; short: string; example: string }> = {
  salary: { title: "Salary earner", short: "Salary", example: "Your employer handles PAYE. We cover the side income: the weekend gig, the rent from the boys' quarters." },
  freelancer: { title: "Freelancer or creator", short: "Freelancer", example: "Client payments, brand deals, Upwork and Fiverr payouts, dollar income." },
  trader: { title: "Trader or small business", short: "Trader", example: "Shop, market stall, online store, POS business. Records or no records." },
  company: { title: "Registered company", short: "Company", example: "Limited companies that need CIT, development levy and VAT ready on time." },
};
