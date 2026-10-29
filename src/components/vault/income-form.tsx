"use client";

import { useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { setAsideForPayment } from "@/lib/setaside/engine";
import type { TaxProfile } from "@/lib/setaside/types";
import type { IncomeEvent, NewIncome } from "@/lib/vault/types";
import { formatNaira } from "../money";

export function IncomeForm({ profile, income, taxYear, onAdd, busy }: { profile: TaxProfile; income: IncomeEvent[]; taxYear: number; onAdd: (income: NewIncome) => Promise<boolean>; busy: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState(0);
  const [receivedOn, setReceivedOn] = useState(today.startsWith(String(taxYear)) ? today : `${taxYear}-12-31`);
  const [source, setSource] = useState("");

  const receivedBefore = income.filter((event) => event.receivedOn <= receivedOn).reduce((total, event) => total + event.amount, 0);
  const preview = amount > 0 ? setAsideForPayment(profile, receivedBefore, amount) : null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (await onAdd({ amount, receivedOn, source })) {
      setAmount(0);
      setSource("");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold"><ArrowDownToLine size={20} className="text-leaf" /> I got paid</h2>
      <p className="mt-1 text-sm text-muted">Log money as it lands. We’ll tell you how much of it is tax.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <label className="block text-sm font-semibold">
          How much came in?
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-muted">₦</span>
            <input autoFocus className="field pl-7 text-lg tabular" inputMode="numeric" value={amount ? amount.toLocaleString("en-NG") : ""} placeholder="250,000" onChange={(event) => setAmount(Number(event.target.value.replace(/[^\d]/g, "")) || 0)} />
          </div>
        </label>
        <label className="block text-sm font-semibold">
          When?
          <input type="date" className="field" min={`${taxYear}-01-01`} max={`${taxYear}-12-31`} value={receivedOn} onChange={(event) => setReceivedOn(event.target.value)} />
        </label>
        <label className="block text-sm font-semibold sm:col-span-2">
          From who or for what? <span className="font-normal text-muted">(optional)</span>
          <input className="field" maxLength={120} value={source} placeholder="e.g. Upwork payout, shop sales this week" onChange={(event) => setSource(event.target.value)} />
        </label>
      </div>

      {preview && (
        <div className="mt-5 rounded-xl bg-paper p-4" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-muted">Set aside for tax</span>
            <span className="font-display text-2xl font-bold tabular text-forest">{formatNaira(preview.total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-muted">
            <span>You keep {formatNaira(amount - preview.total)}</span>
            <span className="tabular">{(preview.effectiveRate * 100).toFixed(1)}% of this payment</span>
          </div>
          {preview.lines.length > 1 && (
            <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
              {preview.lines.map((line) => <li key={line.kind} className="flex justify-between"><span>{line.label}</span><span className="tabular">{formatNaira(line.amount)}</span></li>)}
            </ul>
          )}
          <p className="mt-3 text-xs leading-5 text-muted">{preview.explanation}</p>
        </div>
      )}

      <button disabled={busy || amount <= 0} className="mt-5 w-full rounded-xl bg-forest px-5 py-3 font-semibold text-white hover:bg-leaf disabled:opacity-50 sm:w-auto">Add payment</button>
    </form>
  );
}
