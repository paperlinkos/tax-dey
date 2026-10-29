/**
 * Tax Dey compliance settings: the one file to change when a lawyer, the CBN, the SEC,
 * or a savings partner asks for something different. Pages, the vault and the
 * API read from here; no page hard-codes these rules.
 *
 * Model: Tax Dey is a technology and tax-estimation service. It never receives,
 * holds or pools customer money. Money sits with a licensed partner, in the
 * customer's own name, and moves only on the customer's instruction.
 */

export type VaultProductType = "savings-deposit" | "money-market-fund";

export const compliance = {
  operatingModel: "technology-service-provider" as const,

  /** Must stay false unless Tax Dey obtains a CBN licence that allows holding funds (e.g. MMO). */
  holdsCustomerFunds: false,

  /**
   * Products the vault may use. "money-market-fund" is an investment product and
   * engages SEC rules (ISA 2025): enable only after counsel confirms the partner
   * arrangement covers Tax Dey's role.
   */
  allowedVaultProducts: ["savings-deposit"] as VaultProductType[],

  /** Which partner adapter the live app uses. "sandbox" simulates everything; no real money moves. */
  activePartnerId: "sandbox" as const,

  features: {
    /** Users tap "Move it" for each payment. Required before any automatic sweep. */
    manualMoveConfirmation: true,
    /** Standing mandate to sweep automatically. Off until partner mandate terms are agreed. */
    autoSweep: false,
    /** Showing interest or returns. Off: we do not market returns. */
    showReturns: false,
    /** Bank-account linking to detect income (Mono / CBN open banking). Off until live. */
    openBankingIncomeDetection: false,
    /** Hand off filing to a registered tax practitioner. */
    filingHandoff: true,
  },

  /** Copy shown to users. Change wording here after legal review. */
  disclosures: {
    estimate: "Tax Dey gives estimates, not official tax assessments. Confirm your filing with the relevant tax authority or a registered tax practitioner.",
    custody: "Tax Dey does not hold your money. Your tax vault is an account in your own name with a licensed partner. Only you can move money in or out.",
    sandbox: "Demo mode: no real money moves. Partner integration is not live yet.",
    partnerRevenue: "Tax Dey may receive a fee from our savings partner when you open a vault. It never comes out of your savings.",
    notAdvice: "Tax Dey does not give investment advice.",
  },

  /** Data protection (Nigeria Data Protection Act 2023, GAID 2025). */
  dataProtection: {
    controller: "Tax Dey",
    ndpcRegistration: "pending" as "pending" | "registered",
    dataProtectionOfficer: "to be appointed",
  },

  /**
   * Record of reviews. Add a row whenever counsel or a partner signs off a change,
   * so the app always shows what has been checked and by whom.
   */
  reviewLog: [
    { date: "2026-10-29", by: "Product team", change: "Initial compliance model: technology layer only, partner-held savings, manual confirmation, no returns marketing.", status: "awaiting-legal-review" },
  ] as { date: string; by: string; change: string; status: "awaiting-legal-review" | "approved" }[],
};

export type ComplianceConfig = typeof compliance;
