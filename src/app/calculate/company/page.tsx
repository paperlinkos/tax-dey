"use client";

import Link from "next/link";
import { useState } from "react";
import { formatNaira } from "@/components/money";
import { calculateCompanyTax, type CompanyTaxResult } from "@/lib/tax/company";
import { COMPANY_RULE_2026 } from "@/lib/tax/rules";

const toNumber = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

export default function CompanyCalculatorPage() {
  const [turnover, setTurnover] = useState("");
  const [fixedAssets, setFixedAssets] = useState("");
  const [profit, setProfit] = useState("");
  const [professional, setProfessional] = useState(false);
  const [result, setResult] = useState<CompanyTaxResult | null>(null);

  const field = (label: string, value: string, set: (value: string) => void, hint?: string) => (
    <label className="block text-sm font-semibold">
      {label}
      <input className="field tabular" inputMode="numeric" value={value ? toNumber(value).toLocaleString("en-NG") : ""} placeholder="₦0" onChange={(event) => { set(event.target.value); setResult(null); }} />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-leaf">2026 · Company tax</p>
      <h1 className="mt-3 text-3xl font-bold">Company income tax estimate</h1>
      <p className="mt-3 text-muted">Companies income tax at {COMPANY_RULE_2026.citRate * 100}% plus a {COMPANY_RULE_2026.developmentLevyRate * 100}% development levy, or 0% for qualifying small companies.</p>

      <form className="mt-8 grid gap-5 rounded-2xl border border-line bg-white p-6 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setResult(calculateCompanyTax({ annualTurnover: toNumber(turnover), totalFixedAssets: toNumber(fixedAssets), assessableProfit: toNumber(profit), providesProfessionalServices: professional })); }}>
        {field("Annual turnover", turnover, setTurnover)}
        {field("Total fixed assets", fixedAssets, setFixedAssets, "Buildings, vehicles, machinery, equipment.")}
        {field("Assessable profit", profit, setProfit, "Profit after allowable expenses and capital allowances.")}
        <label className="flex items-start gap-3 self-center text-sm font-semibold">
          <input type="checkbox" className="mt-1 size-4 accent-[var(--color-leaf)]" checked={professional} onChange={(event) => { setProfessional(event.target.checked); setResult(null); }} />
          We provide professional services (law, accounting, consulting, engineering, medical)
        </label>
        <button className="rounded-xl bg-forest px-5 py-3 font-semibold text-white hover:bg-leaf sm:col-span-2 sm:justify-self-start">Calculate estimate</button>
      </form>

      {result && (
        <section className="mt-6 rounded-2xl bg-forest p-6 text-white" aria-live="polite">
          <p className="text-sm text-white/70">{result.smallCompany ? "Treated as a small company" : "Standard company rates"}</p>
          <p className="mt-1 font-display text-4xl font-bold tabular">{formatNaira(result.totalTax)}</p>
          <dl className="mt-5 grid gap-2 text-sm">
            <div className="flex justify-between"><dt>Company income tax ({result.citRate * 100}%)</dt><dd className="tabular">{formatNaira(result.companyIncomeTax)}</dd></div>
            <div className="flex justify-between"><dt>Development levy</dt><dd className="tabular">{formatNaira(result.developmentLevy)}</dd></div>
          </dl>
          {result.reviewFlags.map((flag) => <p key={flag} className="mt-4 rounded-xl bg-white/10 p-3 text-sm">{flag}</p>)}
          <Link href="/vault" className="mt-6 inline-block rounded-xl bg-gold px-5 py-3 font-semibold text-forest">Set this aside as you get paid →</Link>
        </section>
      )}
      <p className="mt-6 text-xs leading-5 text-muted">Estimate only. Excludes capital gains tax, withholding tax credits, VAT and the minimum effective tax rate. {COMPANY_RULE_2026.review.note}</p>
    </main>
  );
}
