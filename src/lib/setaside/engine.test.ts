import { describe, expect, it } from "vitest";
import { calculatePersonalIncomeTax } from "@/lib/tax/calculator";
import { liabilityToDate, setAsideForPayment } from "./engine";
import { DEFAULT_PROFILE, type TaxProfile } from "./types";

const profile = (overrides: Partial<TaxProfile>): TaxProfile => ({ ...DEFAULT_PROFILE.freelancer, bufferRate: 0, ...overrides });
const personal = (income: number) => calculatePersonalIncomeTax({ taxYear: 2026, annualEmploymentIncome: income, qualifyingAnnualRent: 0, taxAlreadyPaid: 0 }).annualTax;

describe("set-aside engine", () => {
  it("adds up to the full-year tax however the income is split", () => {
    const freelancer = profile({ profitMargin: 1 });
    const payments = [250_000, 600_000, 1_200_000, 90_000, 2_000_000, 3_500_000];
    let received = 0;
    let saved = 0;
    for (const payment of payments) {
      saved += setAsideForPayment(freelancer, received, payment).total;
      received += payment;
    }
    const exact = personal(received);
    // Rounding up each payment can add at most ₦1 per payment.
    expect(saved).toBeGreaterThanOrEqual(exact);
    expect(saved - exact).toBeLessThanOrEqual(payments.length);
  });

  it("sets nothing aside inside the tax-free ₦800,000", () => {
    expect(setAsideForPayment(profile({ profitMargin: 1 }), 0, 500_000).total).toBe(0);
  });

  it("taxes side income at the salary earner's marginal band", () => {
    // ₦5m salary sits in the 18% band, so ₦100k side income adds ₦18k.
    const salaryEarner = profile({ segment: "salary", annualSalary: 5_000_000, payeHandledByEmployer: true });
    expect(setAsideForPayment(salaryEarner, 0, 100_000).total).toBe(18_000);
  });

  it("treats logged income as salary when PAYE is not deducted", () => {
    const unpaid = profile({ segment: "salary", annualSalary: 5_000_000, payeHandledByEmployer: false });
    expect(setAsideForPayment(unpaid, 0, 3_000_000).total).toBe(330_000);
  });

  it("only taxes the profit share of a freelancer's receipt", () => {
    const freelancer = profile({ profitMargin: 0.5 });
    expect(setAsideForPayment(freelancer, 2_000_000, 1_000_000).total).toBe(personal(1_500_000) - personal(1_000_000));
  });

  it("adds a safety cushion on top of the tax", () => {
    const result = setAsideForPayment(profile({ profitMargin: 1, bufferRate: 0.1 }), 1_000_000, 100_000);
    expect(result.total).toBe(16_500);
    expect(result.lines.map((line) => line.kind)).toEqual(["income-tax", "buffer"]);
  });

  it("charges traders without records 1% once they lose the nano exemption", () => {
    const trader = profile({ segment: "trader", keepsRecords: false, expectedAnnualTurnover: 20_000_000, hasFixedPremises: true });
    expect(setAsideForPayment(trader, 0, 100_000).total).toBe(1_000);
  });

  it("catches up the whole year when a nano trader passes ₦12m", () => {
    const trader = profile({ segment: "trader", keepsRecords: false, expectedAnnualTurnover: 5_000_000, hasFixedPremises: false, hasEmployees: false });
    expect(setAsideForPayment(trader, 6_000_000, 1_000_000).total).toBe(0);
    expect(setAsideForPayment(trader, 11_500_000, 1_000_000).total).toBe(125_000);
  });

  it("splits a company receipt into CIT, levy and VAT", () => {
    const company = profile({ segment: "company", expectedAnnualTurnover: 200_000_000, totalFixedAssets: 0, profitMargin: 0.2, providesProfessionalServices: false, chargesVat: true });
    const result = setAsideForPayment(company, 0, 1_075_000);
    expect(result.lines.find((line) => line.kind === "vat")?.amount).toBeCloseTo(75_000);
    expect(result.lines.find((line) => line.kind === "company-tax")?.amount).toBeCloseTo(60_000);
    expect(result.lines.find((line) => line.kind === "development-levy")?.amount).toBeCloseTo(8_000);
    expect(result.total).toBe(143_000);
  });

  it("only holds VAT for a small company", () => {
    const small = profile({ segment: "company", expectedAnnualTurnover: 20_000_000, totalFixedAssets: 0, providesProfessionalServices: false, chargesVat: true });
    expect(setAsideForPayment(small, 0, 107_500).lines.map((line) => line.kind)).toEqual(["vat"]);
  });

  it("reports the year-to-date liability", () => {
    expect(liabilityToDate(profile({ profitMargin: 1 }), 3_000_000).lines[0].amount).toBe(330_000);
  });

  it("rejects non-positive payments", () => expect(() => setAsideForPayment(profile({}), 0, 0)).toThrow("positive"));
});
