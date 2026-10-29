"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { calculatePersonalIncomeTax } from "@/lib/tax/calculator";
import type { TaxCalculation } from "@/lib/tax/types";
import { saveAssessment } from "@/lib/filing/store";
import { useLanguage } from "./language-provider";
import { Naira } from "./money";

// "Other deductions" was shown but never used in the sum, so it's no longer asked.
const fields = ["annualEmploymentIncome", "qualifyingAnnualRent", "taxAlreadyPaid"] as const;
type Field = typeof fields[number];

const toNumber = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

export function CalculatorForm() {
  const { t, language } = useLanguage();
  const [values, setValues] = useState<Record<Field, string>>({ annualEmploymentIncome: "", qualifyingAnnualRent: "", taxAlreadyPaid: "" });
  const [result, setResult] = useState<TaxCalculation | null>(null);
  const [error, setError] = useState("");
  const questions: Record<Field, { label: string; hint: string }> = {
    annualEmploymentIncome: { label: t.income, hint: t.incomeHint },
    qualifyingAnnualRent: { label: t.rent, hint: t.rentHint },
    taxAlreadyPaid: { label: t.paid, hint: t.paidHint },
  };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const calculation = calculatePersonalIncomeTax({ taxYear: 2026, annualEmploymentIncome: toNumber(values.annualEmploymentIncome), qualifyingAnnualRent: toNumber(values.qualifyingAnnualRent), taxAlreadyPaid: toNumber(values.taxAlreadyPaid) });
      setResult(calculation);
      saveAssessment({ version: 1, category: "salary", createdAt: new Date().toISOString(), calculationStatus: "estimate-available", grossIncome: calculation.grossIncome, deductions: calculation.verifiedDeductions, chargeableIncome: calculation.chargeableIncome, tax: calculation.annualTax, credits: calculation.taxAlreadyPaid, balance: calculation.balance, flags: [], language });
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to calculate.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-6">
        <div className="space-y-6">
          {fields.map((field) => (
            <label key={field} className="block text-base font-semibold">
              {questions[field].label}
              <span className="mt-1 block text-sm font-normal text-muted">{questions[field].hint}</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-muted">₦</span>
                <input inputMode="numeric" value={values[field] ? toNumber(values[field]).toLocaleString("en-NG") : ""} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} className="field pl-7 tabular" placeholder="0" />
              </div>
            </label>
          ))}
        </div>
        <p className="mt-5 rounded-xl bg-mint/60 p-3 text-sm leading-6 text-forest">{t.explanation}</p>
        {error && <p role="alert" className="mt-3 text-sm text-clay">{error}</p>}
        <button className="mt-6 w-full rounded-xl bg-forest px-5 py-3.5 font-semibold text-white hover:bg-leaf">{t.calculateEstimate}</button>
      </form>

      <section aria-live="polite" className="rounded-2xl border border-line bg-white p-6">
        {result ? <Results result={result} /> : (
          <div className="grid h-full min-h-64 place-items-center text-center">
            <div>
              <p className="font-display text-xl font-bold">{t.resultWaiting}</p>
              <p className="mt-2 text-muted">{t.taxFreeNote}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  function Results({ result }: { result: TaxCalculation }) {
    const details = [[t.gross, result.grossIncome], [t.deductions, result.verifiedDeductions], [t.chargeable, result.chargeableIncome], [t.alreadyPaid, result.taxAlreadyPaid]] as const;
    return (
      <>
        <div className="rounded-2xl bg-forest p-5 text-white">
          <p className="text-sm text-white/70">{t.estimatedTax}</p>
          <p className="mt-1 font-display text-4xl font-bold tabular"><Naira value={result.annualTax} /></p>
          <p className="mt-1 text-white/80">{t.monthly}: <strong className="tabular"><Naira value={result.monthlyTax} /></strong></p>
        </div>

        {result.taxAlreadyPaid > 0 && (
          <div className="mt-4 flex justify-between gap-3 rounded-xl bg-gold-soft p-4 font-bold">
            <span>{result.balance >= 0 ? t.remaining : t.overpayment}</span>
            <span className="tabular"><Naira value={Math.abs(result.balance)} /></span>
          </div>
        )}

        <h2 className="mt-7 text-base font-bold">{t.bandBreakdown}</h2>
        <dl className="mt-3 space-y-2.5">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-line pb-2.5 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-semibold tabular"><Naira value={value} /></dd>
            </div>
          ))}
        </dl>
        <ul className="mt-4 space-y-2">
          {result.bands.map((band) => (
            <li key={band.label} className="flex justify-between gap-3 rounded-lg bg-paper p-3 text-sm">
              <span><Naira value={band.taxableAmount} /> {t.bandRow} {(band.rate * 100).toFixed(0)}%</span>
              <strong className="tabular"><Naira value={band.tax} /></strong>
            </li>
          ))}
        </ul>

        {result.annualTax > 0 && (
          <Link href="/vault" className="mt-6 flex items-center justify-between gap-3 rounded-xl border-2 border-gold p-4 font-semibold text-forest hover:bg-gold-soft">
            <span>{t.vaultCta}: <span className="tabular"><Naira value={result.monthlyTax} /></span> {t.perMonth}</span>
            <ArrowRight size={18} className="shrink-0" />
          </Link>
        )}
        <p className="mt-5 text-xs leading-5 text-muted">{t.estimateNotice}</p>
      </>
    );
  }
}
