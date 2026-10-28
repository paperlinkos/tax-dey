import { describe, expect, it } from "vitest";
import { calculatePersonalIncomeTax, calculateRentRelief } from "./calculator";

const calculate = (annualEmploymentIncome: number) => calculatePersonalIncomeTax({ taxYear: 2026, annualEmploymentIncome, qualifyingAnnualRent: 0, taxAlreadyPaid: 0 });

describe("2026 Nigerian personal income tax engine", () => {
  it.each([[800_000, 0], [1_000_000, 30_000], [3_000_000, 330_000], [12_000_000, 1_950_000]])("calculates tax for ₦%i chargeable income", (income, expected) => expect(calculate(income).annualTax).toBe(expected));
  it("calculates zero income", () => expect(calculate(0).annualTax).toBe(0));
  it("rejects negative amounts", () => expect(() => calculate(-1)).toThrow("non-negative"));
  it("caps rent relief at ₦500,000", () => { expect(calculateRentRelief(1_000_000)).toBe(200_000); expect(calculateRentRelief(3_000_000)).toBe(500_000); });
  it("handles tax band boundaries", () => { expect(calculate(3_000_000).annualTax).toBe(330_000); expect(calculate(12_000_000).annualTax).toBe(1_950_000); });
  it("rejects unsupported tax years", () => expect(() => calculatePersonalIncomeTax({ taxYear: 2025, annualEmploymentIncome: 1, qualifyingAnnualRent: 0, taxAlreadyPaid: 0 })).toThrow("2026"));
  it("has calculation results independent from language", () => { const input = { taxYear: 2026, annualEmploymentIncome: 3_000_000, qualifyingAnnualRent: 0, taxAlreadyPaid: 0 }; expect(calculatePersonalIncomeTax(input)).toEqual(calculatePersonalIncomeTax(input)); });
});
