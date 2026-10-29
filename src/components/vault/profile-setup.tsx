"use client";

import { useState } from "react";
import { Briefcase, Building2, Laptop, Store } from "lucide-react";
import { DEFAULT_PROFILE, SEGMENT_LABELS, type Segment, type TaxProfile } from "@/lib/setaside/types";

const ICONS: Record<Segment, typeof Briefcase> = { salary: Briefcase, freelancer: Laptop, trader: Store, company: Building2 };

export function SegmentPicker({ value, onChange }: { value: Segment | null; onChange: (segment: Segment) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(SEGMENT_LABELS) as Segment[]).map((segment) => {
        const Icon = ICONS[segment];
        const selected = value === segment;
        return (
          <button key={segment} type="button" onClick={() => onChange(segment)} aria-pressed={selected} className={`rounded-2xl border p-5 text-left transition ${selected ? "border-leaf bg-mint" : "border-line bg-white hover:border-leaf"}`}>
            <Icon className="text-leaf" size={22} />
            <span className="mt-3 block font-display text-lg font-bold">{SEGMENT_LABELS[segment].title}</span>
            <span className="mt-1 block text-sm leading-6 text-muted">{SEGMENT_LABELS[segment].example}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProfileSetup({ initial, onSave, saving }: { initial: TaxProfile | null; onSave: (profile: TaxProfile) => void; saving: boolean }) {
  const [profile, setProfile] = useState<TaxProfile | null>(initial);
  const set = <K extends keyof TaxProfile>(key: K, value: TaxProfile[K]) => setProfile((current) => (current ? { ...current, [key]: value } : current));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold">Which one sounds like you?</h2>
        <p className="mt-1 text-muted">Pick the closest. You can change it later.</p>
        <div className="mt-5">
          <SegmentPicker value={profile?.segment ?? null} onChange={(segment) => setProfile(profile?.segment === segment ? profile : { ...DEFAULT_PROFILE[segment] })} />
        </div>
      </section>

      {profile && (
        <form className="rounded-2xl border border-line bg-white p-6" onSubmit={(event) => { event.preventDefault(); onSave(profile); }}>
          <h2 className="text-xl font-bold">A few quick questions</h2>
          <p className="mt-1 text-sm text-muted">These help us work out the tax inside each payment. Rough numbers are fine.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {profile.segment === "salary" && (
              <>
                <YesNo label="Does your employer deduct PAYE from your salary?" value={profile.payeHandledByEmployer} onChange={(value) => set("payeHandledByEmployer", value)} />
                {profile.payeHandledByEmployer && <Amount label="Your yearly salary" hint="So we know which tax band your extra income falls into." value={profile.annualSalary} onChange={(value) => set("annualSalary", value)} />}
                <Amount label="Rent you pay for your home each year" hint="20% of it, up to ₦500,000, reduces your taxable income." value={profile.qualifyingAnnualRent} onChange={(value) => set("qualifyingAnnualRent", value)} />
              </>
            )}

            {profile.segment === "freelancer" && (
              <>
                <Amount label="Salary from a job (if any)" hint="Leave at ₦0 if freelancing is all you do." value={profile.annualSalary} onChange={(value) => set("annualSalary", value)} />
                <Percent label="How much of what you earn is profit after work costs?" hint="Data, equipment, software, workspace. Most freelancers are around 70–90%." value={profile.profitMargin} onChange={(value) => set("profitMargin", value)} min={0.3} />
                <Amount label="Rent you pay for your home each year" value={profile.qualifyingAnnualRent} onChange={(value) => set("qualifyingAnnualRent", value)} />
              </>
            )}

            {profile.segment === "trader" && (
              <>
                <YesNo label="Do you keep records of your sales and costs?" value={profile.keepsRecords} onChange={(value) => set("keepsRecords", value)} />
                {profile.keepsRecords ? (
                  <Percent label="Roughly how much of your sales is profit?" hint="What's left after buying stock and paying business costs." value={profile.profitMargin} onChange={(value) => set("profitMargin", value)} min={0.05} />
                ) : (
                  <>
                    <Amount label="How much do you expect to sell this year?" hint="Total sales, not profit." value={profile.expectedAnnualTurnover} onChange={(value) => set("expectedAnnualTurnover", value)} />
                    <YesNo label="Do you have a shop or fixed place of business?" value={profile.hasFixedPremises} onChange={(value) => set("hasFixedPremises", value)} />
                    <YesNo label="Do you have staff or apprentices you pay?" value={profile.hasEmployees} onChange={(value) => set("hasEmployees", value)} />
                  </>
                )}
              </>
            )}

            {profile.segment === "company" && (
              <>
                <Amount label="Expected turnover this year" value={profile.expectedAnnualTurnover} onChange={(value) => set("expectedAnnualTurnover", value)} />
                <Amount label="Total fixed assets" hint="Buildings, vehicles, machinery, equipment." value={profile.totalFixedAssets} onChange={(value) => set("totalFixedAssets", value)} />
                <Percent label="Profit margin before tax" value={profile.profitMargin} onChange={(value) => set("profitMargin", value)} min={0} />
                <YesNo label="Do you provide professional services?" hint="Law, accounting, consulting, engineering, medical. These can't be treated as small companies." value={profile.providesProfessionalServices} onChange={(value) => set("providesProfessionalServices", value)} />
                <YesNo label="Do you charge your customers VAT?" hint="If yes, we hold back the VAT part of each receipt too." value={profile.chargesVat} onChange={(value) => set("chargesVat", value)} />
              </>
            )}

            <label className="block text-sm font-semibold">
              Safety cushion
              <select className="field" value={profile.bufferRate} onChange={(event) => set("bufferRate", Number(event.target.value))}>
                <option value={0}>None, just the estimate</option>
                <option value={0.05}>Add 5% extra</option>
                <option value={0.1}>Add 10% extra</option>
                <option value={0.2}>Add 20% extra</option>
              </select>
              <span className="mt-1 block text-xs font-normal text-muted">Extra money set aside in case your income or costs change. Anything left over is yours.</span>
            </label>
          </div>
          <button disabled={saving} className="mt-7 rounded-xl bg-forest px-5 py-3 font-semibold text-white hover:bg-leaf disabled:opacity-60">{saving ? "Saving…" : "Save and open my vault"}</button>
        </form>
      )}
    </div>
  );
}

function YesNo({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <fieldset className="text-sm">
      <legend className="font-semibold">{label}</legend>
      <div className="mt-2 flex gap-2">
        {[true, false].map((option) => (
          <button key={String(option)} type="button" onClick={() => onChange(option)} aria-pressed={value === option} className={`rounded-xl border px-4 py-2 font-medium ${value === option ? "border-leaf bg-mint text-forest" : "border-line bg-white"}`}>{option ? "Yes" : "No"}</button>
        ))}
      </div>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </fieldset>
  );
}

function Amount({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-muted">₦</span>
        <input className="field pl-7 tabular" inputMode="numeric" value={value ? value.toLocaleString("en-NG") : ""} placeholder="0" onChange={(event) => onChange(Number(event.target.value.replace(/[^\d]/g, "")) || 0)} />
      </div>
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

function Percent({ label, hint, value, onChange, min }: { label: string; hint?: string; value: number; onChange: (value: number) => void; min: number }) {
  return (
    <label className="block text-sm font-semibold">
      {label} <span className="tabular text-leaf">{Math.round(value * 100)}%</span>
      <input type="range" min={min * 100} max={100} step={5} value={Math.round(value * 100)} onChange={(event) => onChange(Number(event.target.value) / 100)} className="mt-3 w-full accent-[var(--color-leaf)]" />
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}
