import { PRESUMPTIVE_RULE_2026 } from "./rules";

export type PresumptiveInput = {
  annualTurnover: number;
  hasFixedPremises: boolean;
  hasEmployees: boolean;
};

export type PresumptiveResult = { exempt: boolean; rate: number; tax: number };

export function isNanoExempt(input: PresumptiveInput): boolean {
  return input.annualTurnover <= PRESUMPTIVE_RULE_2026.nanoExemptionTurnover && !input.hasFixedPremises && !input.hasEmployees;
}

export function calculatePresumptiveTax(input: PresumptiveInput): PresumptiveResult {
  if (!Number.isFinite(input.annualTurnover) || input.annualTurnover < 0) throw new Error("Annual turnover must be a non-negative number.");
  const exempt = isNanoExempt(input);
  const rate = exempt ? 0 : PRESUMPTIVE_RULE_2026.turnoverRate;
  return { exempt, rate, tax: input.annualTurnover * rate };
}
