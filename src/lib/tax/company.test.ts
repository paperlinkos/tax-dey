import { describe, expect, it } from "vitest";
import { calculateCompanyTax } from "./company";
import { calculatePresumptiveTax } from "./presumptive";

const company = (overrides: Partial<Parameters<typeof calculateCompanyTax>[0]> = {}) =>
  calculateCompanyTax({ annualTurnover: 200_000_000, totalFixedAssets: 10_000_000, assessableProfit: 40_000_000, providesProfessionalServices: false, ...overrides });

describe("2026 company tax", () => {
  it("charges 30% CIT plus 4% development levy for a standard company", () => {
    const result = company();
    expect(result.smallCompany).toBe(false);
    expect(result.companyIncomeTax).toBe(12_000_000);
    expect(result.developmentLevy).toBe(1_600_000);
    expect(result.totalTax).toBe(13_600_000);
  });

  it("charges nothing for a small company", () => {
    const result = company({ annualTurnover: 30_000_000, assessableProfit: 5_000_000 });
    expect(result.smallCompany).toBe(true);
    expect(result.totalTax).toBe(0);
  });

  it("never treats professional services firms as small", () => {
    expect(company({ annualTurnover: 30_000_000, providesProfessionalServices: true }).smallCompany).toBe(false);
  });

  it("is not small when fixed assets exceed the limit", () => {
    expect(company({ annualTurnover: 30_000_000, totalFixedAssets: 300_000_000 }).smallCompany).toBe(false);
  });

  it("flags the minimum effective tax rate for very large companies", () => {
    expect(company({ annualTurnover: 60_000_000_000 }).reviewFlags.join(" ")).toContain("15%");
  });

  it("rejects negative amounts", () => expect(() => company({ assessableProfit: -1 })).toThrow("non-negative"));
});

describe("2026 presumptive tax", () => {
  it("charges 1% of turnover", () => {
    expect(calculatePresumptiveTax({ annualTurnover: 20_000_000, hasFixedPremises: true, hasEmployees: false }).tax).toBe(200_000);
  });

  it("exempts nano businesses with no premises and no employees", () => {
    const result = calculatePresumptiveTax({ annualTurnover: 12_000_000, hasFixedPremises: false, hasEmployees: false });
    expect(result.exempt).toBe(true);
    expect(result.tax).toBe(0);
  });

  it("does not exempt a small trader who has a shop", () => {
    expect(calculatePresumptiveTax({ annualTurnover: 5_000_000, hasFixedPremises: true, hasEmployees: false }).tax).toBe(50_000);
  });
});
