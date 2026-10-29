import { calculatePersonalIncomeTax } from "@/lib/tax/calculator";
import { calculateCompanyTax } from "@/lib/tax/company";
import { calculatePresumptiveTax } from "@/lib/tax/presumptive";
import { SUPPORTED_TAX_YEAR, VAT_RULE_2026 } from "@/lib/tax/rules";
import type { SetAsideLine, SetAsideResult, TaxProfile } from "./types";

/**
 * The set-aside rule: for each payment, put away exactly the extra tax that this
 * payment creates for the year.
 *
 *   setAside = liability(income so far + this payment) − liability(income so far)
 *
 * Because it works on the running total, the sum of every set-aside equals the
 * full-year liability, however irregular the income is. The tax-free band is used
 * up first, then each later payment is taxed at the band it actually falls in.
 */

type Liability = { lines: SetAsideLine[]; reviewFlags: string[] };

const VAT_FRACTION = VAT_RULE_2026.rate / (1 + VAT_RULE_2026.rate);

function personalTax(profile: TaxProfile, extraTaxableIncome: number): number {
  const base = profile.payeHandledByEmployer ? profile.annualSalary : 0;
  const tax = (income: number) => calculatePersonalIncomeTax({ taxYear: SUPPORTED_TAX_YEAR, annualEmploymentIncome: income, qualifyingAnnualRent: profile.qualifyingAnnualRent, taxAlreadyPaid: 0 }).annualTax;
  // PAYE already covers tax on the salary itself; we only owe the difference created by extra income.
  return tax(base + extraTaxableIncome) - tax(base);
}

/** Total tax owed on everything received so far this year (`received` is gross receipts, VAT included where charged). */
export function liabilityToDate(profile: TaxProfile, received: number): Liability {
  const reviewFlags: string[] = [];

  switch (profile.segment) {
    case "salary": {
      // Without PAYE, the logged income is the salary itself.
      return { lines: [{ kind: "income-tax", label: "Personal income tax", amount: personalTax(profile, received) }], reviewFlags };
    }
    case "freelancer": {
      const profit = received * profile.profitMargin;
      if (profile.profitMargin < 1) reviewFlags.push("Business costs are estimated from your profit margin. Keep receipts to back them up.");
      return { lines: [{ kind: "income-tax", label: "Personal income tax", amount: personalTax(profile, profit) }], reviewFlags };
    }
    case "trader": {
      if (profile.keepsRecords) {
        const profit = received * profile.profitMargin;
        return { lines: [{ kind: "income-tax", label: "Personal income tax", amount: personalTax(profile, profit) }], reviewFlags };
      }
      // Exemption is judged on the whole year's turnover, so use the larger of the forecast and actual takings.
      const annualTurnover = Math.max(profile.expectedAnnualTurnover, received);
      const presumptive = calculatePresumptiveTax({ annualTurnover, hasFixedPremises: profile.hasFixedPremises, hasEmployees: profile.hasEmployees });
      reviewFlags.push("No records means the presumptive regime: 1% of turnover. Keeping records may lower or raise this.");
      return { lines: [{ kind: "presumptive-tax", label: "Presumptive tax (1% of sales)", amount: presumptive.exempt ? 0 : received * presumptive.rate }], reviewFlags };
    }
    case "company": {
      const vat = profile.chargesVat ? received * VAT_FRACTION : 0;
      const turnover = received - vat;
      const annualTurnover = Math.max(profile.expectedAnnualTurnover, turnover);
      const company = calculateCompanyTax({ annualTurnover, totalFixedAssets: profile.totalFixedAssets, assessableProfit: turnover * profile.profitMargin, providesProfessionalServices: profile.providesProfessionalServices });
      reviewFlags.push(...company.reviewFlags);
      const lines: SetAsideLine[] = [
        { kind: "company-tax", label: `Company income tax (${Math.round(company.citRate * 100)}% of profit)`, amount: company.companyIncomeTax },
        { kind: "development-levy", label: "Development levy (4% of profit)", amount: company.developmentLevy },
      ];
      if (profile.chargesVat) lines.push({ kind: "vat", label: "VAT you collected (7.5%)", amount: vat });
      return { lines, reviewFlags };
    }
  }
}

const sum = (lines: SetAsideLine[]) => lines.reduce((total, line) => total + line.amount, 0);

export function setAsideForPayment(profile: TaxProfile, receivedSoFar: number, payment: number): SetAsideResult {
  if (!Number.isFinite(payment) || payment <= 0) throw new Error("Payment must be a positive amount.");
  if (!Number.isFinite(receivedSoFar) || receivedSoFar < 0) throw new Error("Income so far must be a non-negative amount.");

  const before = liabilityToDate(profile, receivedSoFar);
  const after = liabilityToDate(profile, receivedSoFar + payment);

  const lines: SetAsideLine[] = after.lines
    .map((line) => ({ ...line, amount: line.amount - (before.lines.find((previous) => previous.kind === line.kind)?.amount ?? 0) }))
    .filter((line) => line.amount > 0.005);

  const taxPortion = sum(lines);
  if (profile.bufferRate > 0 && taxPortion > 0) lines.push({ kind: "buffer", label: `Safety cushion (${Math.round(profile.bufferRate * 100)}%)`, amount: taxPortion * profile.bufferRate });

  const total = Math.ceil(sum(lines));
  return { total, lines, effectiveRate: total / payment, explanation: explain(profile, total, receivedSoFar), reviewFlags: after.reviewFlags };
}

function explain(profile: TaxProfile, total: number, receivedSoFar: number): string {
  if (total > 0) return "This is the extra tax this payment adds to your year. Move it now and it will be there when the tax is due.";
  if (profile.segment === "trader" && !profile.keepsRecords) return "Your business looks exempt from presumptive tax at this turnover. We'll start setting aside if your sales pass ₦12m or you get a shop or staff.";
  if (profile.segment === "company") return "Small companies pay 0% company tax. Nothing to set aside unless you charge VAT.";
  return receivedSoFar === 0 ? "This payment falls inside the tax-free part of your income (the first ₦800,000 a year)." : "You are still inside the tax-free part of your income this year.";
}
