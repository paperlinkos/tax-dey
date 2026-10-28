import { describe, expect, it } from "vitest";
import { annualiseRevenue, calculateBusinessAssessment } from "./calculator";
import type { BusinessAssessmentInput } from "./types";

const base = (overrides: Partial<BusinessAssessmentInput> = {}): BusinessAssessmentInput => ({ taxYear: 2026, profile: { taxpayerKind: "freelancer", workDescription: "Design work", isRegistered: false, operatingThroughCompany: false, hasSalary: false }, businessIncome: { revenue: 1_000_000, period: "yearly", hasRecords: true, otherIncome: 0 }, expenses: [], personal: { annualSalary: 0, qualifyingAnnualRent: 0 }, payments: [], ...overrides });

describe("business assessment", () => {
  it("handles zero business revenue", () => expect(calculateBusinessAssessment(base({ businessIncome: { revenue: 0, period: "yearly", hasRecords: true, otherIncome: 0 } })).annualBusinessRevenue).toBe(0));
  it("distinguishes revenue and profit", () => { const result = calculateBusinessAssessment(base({ expenses: [{ category: "stock", amount: 200_000, verification: "verified" }] })); expect(result.annualBusinessRevenue).toBe(1_000_000); expect(result.estimatedBusinessProfit).toBe(800_000); });
  it("annualises monthly revenue", () => expect(annualiseRevenue(100_000, "monthly")).toBe(1_200_000));
  it("combines salary and business income", () => { const result = calculateBusinessAssessment(base({ profile: { taxpayerKind: "freelancer", workDescription: "Design", isRegistered: false, operatingThroughCompany: false, hasSalary: true }, personal: { annualSalary: 2_000_000, qualifyingAnnualRent: 0 } })); expect(result.personalTax?.grossIncome).toBe(3_000_000); });
  it("excludes personal and unverified expenses", () => { const result = calculateBusinessAssessment(base({ expenses: [{ category: "personal", amount: 100, verification: "personal" }, { category: "other", amount: 200, verification: "requires-review" }] })); expect(result.verifiedDeductibleExpenses).toBe(0); expect(result.personalTax).toBeNull(); });
  it("does not expense capital purchases", () => { const result = calculateBusinessAssessment(base({ expenses: [{ category: "capital", amount: 500_000, verification: "capital" }] })); expect(result.verifiedDeductibleExpenses).toBe(0); });
  it("requires review when records are missing", () => expect(calculateBusinessAssessment(base({ businessIncome: { revenue: 1, period: "yearly", hasRecords: false, otherIncome: 0 } })).completeness.status).toBe("professional-review-required"));
  it("requires review for company situations", () => expect(calculateBusinessAssessment(base({ profile: { taxpayerKind: "freelancer", workDescription: "Work", isRegistered: false, operatingThroughCompany: true, hasSalary: false } })).personalTax).toBeNull());
  it("prevents a business-premises expense from duplicating personal rent relief", () => { const result = calculateBusinessAssessment(base({ expenses: [{ category: "premises-rent", amount: 200_000, verification: "verified" }], personal: { annualSalary: 0, qualifyingAnnualRent: 1_000_000 } })); expect(result.verifiedDeductibleExpenses).toBe(200_000); expect(result.personalTax?.rentRelief).toBe(200_000); });
});
