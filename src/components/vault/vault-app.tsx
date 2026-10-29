"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FlaskConical, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { compliance } from "@/config/compliance";
import { partnerById } from "@/config/partners";
import { SEGMENT_LABELS, type TaxProfile } from "@/lib/setaside/types";
import type { VaultAction } from "@/lib/vault/actions";
import { accountVault, demoVault, type VaultClient } from "@/lib/vault/client";
import { deadlinesFor } from "@/lib/vault/deadlines";
import { summarise } from "@/lib/vault/ledger";
import type { NewIncome, VaultState } from "@/lib/vault/types";
import { formatNaira } from "../money";
import { IncomeForm } from "./income-form";
import { History, PendingMoves } from "./payment-list";
import { ProfileSetup } from "./profile-setup";
import { VaultSummaryPanel } from "./vault-summary";

export function VaultApp() {
  const [client, setClient] = useState<VaultClient | null>(null);
  const [state, setState] = useState<VaultState | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await fetch("/api/auth/get-session").then((response) => (response.ok ? response.json() : null)).catch(() => null);
      const chosen = session ? accountVault : demoVault;
      // `/vault?sample=1` opens the demo with a sample year, for pitches and walkthroughs.
      const wantsSample = !session && new URLSearchParams(window.location.search).get("sample") === "1";
      try {
        const loaded = wantsSample ? await demoVault.loadSample() : await chosen.load();
        if (!cancelled) { setClient(chosen); setState(loaded); }
      } catch {
        // Database unavailable: fall back to the demo so the page still works.
        const loaded = await demoVault.load();
        if (!cancelled) { setClient(demoVault); setState(loaded); setError("We couldn't reach your account vault, so you're in demo mode."); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const act = useCallback(async (action: VaultAction) => {
    if (!client) return false;
    setBusy(true);
    setError("");
    try {
      setState(await client.act(action));
      return true;
    } catch (failure) {
      setError((failure as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }, [client]);

  if (!client || !state) return <p className="py-24 text-center text-muted">Opening your vault…</p>;

  const isDemo = client.mode === "demo";
  const partner = partnerById(state.partnerId);

  const saveProfile = async (profile: TaxProfile) => {
    if (await act({ type: "set-profile", profile })) setEditingProfile(false);
  };

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
          <FlaskConical size={18} className="text-clay" />
          <p className="flex-1"><strong>Demo vault.</strong> {compliance.disclosures.sandbox} Saved only in this browser. <Link href="/register" className="font-semibold text-leaf underline">Create an account</Link> to keep it.</p>
          <button onClick={async () => { setBusy(true); setState(await demoVault.loadSample()); setBusy(false); }} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-medium hover:border-leaf"><Sparkles size={14} /> Load sample year</button>
          <button onClick={() => setState(demoVault.reset())} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-muted hover:text-ink"><RotateCcw size={14} /> Reset</button>
        </div>
      )}

      {error && <p role="alert" className="rounded-xl bg-clay/10 p-4 text-sm font-medium text-clay">{error}</p>}

      {!state.profile || editingProfile ? (
        <ProfileSetup initial={state.profile} onSave={saveProfile} saving={busy} />
      ) : (
        <Dashboard state={state} profile={state.profile} partnerName={partner?.name ?? state.partnerId} busy={busy} act={act} onEditProfile={() => setEditingProfile(true)} />
      )}
    </div>
  );
}

function Dashboard({ state, profile, partnerName, busy, act, onEditProfile }: { state: VaultState; profile: TaxProfile; partnerName: string; busy: boolean; act: (action: VaultAction) => Promise<boolean>; onEditProfile: () => void }) {
  const summary = summarise(state);
  const deadlines = deadlinesFor(profile.segment, state.taxYear, profile.segment === "company" && profile.chargesVat, new Date());
  const addIncome = (income: NewIncome) => act({ type: "add-income", income });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Set up as <strong className="text-ink">{SEGMENT_LABELS[profile.segment].title}</strong> · {state.taxYear} tax year</p>
        <button onClick={onEditProfile} className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"><Pencil size={14} /> Change my details</button>
      </div>

      <VaultSummaryPanel summary={summary} deadlines={deadlines} partnerName={partnerName} />

      <PendingMoves income={state.income} busy={busy} onMove={(incomeId) => act({ type: "move", incomeId })} onSkip={(incomeId) => act({ type: "skip", incomeId })} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <IncomeForm profile={profile} income={state.income} taxYear={state.taxYear} onAdd={addIncome} busy={busy} />
        <PayTax inVault={summary.inVault} busy={busy} onPay={(amount) => act({ type: "withdraw", amount, reason: "tax-payment" })} />
      </div>

      <History income={state.income} moves={state.moves} busy={busy} onRemove={(incomeId) => act({ type: "remove-income", incomeId })} />
      <p className="text-xs leading-5 text-muted">{compliance.disclosures.estimate} {compliance.disclosures.notAdvice}</p>
    </>
  );
}

function PayTax({ inVault, busy, onPay }: { inVault: number; busy: boolean; onPay: (amount: number) => Promise<boolean> }) {
  const [amount, setAmount] = useState(0);
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-xl font-bold">Filing time</h2>
      <p className="mt-1 text-sm leading-6 text-muted">When your tax is assessed, pay it straight from your vault. Prefer help filing? We can connect you to a registered tax practitioner.</p>
      <form className="mt-5 flex flex-wrap gap-3" onSubmit={async (event) => { event.preventDefault(); if (await onPay(amount)) setAmount(0); }}>
        <div className="relative min-w-40 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-muted">₦</span>
          <input aria-label="Amount to pay" className="field pl-7 tabular" inputMode="numeric" value={amount ? amount.toLocaleString("en-NG") : ""} placeholder={inVault ? inVault.toLocaleString("en-NG") : "0"} onChange={(event) => setAmount(Number(event.target.value.replace(/[^\d]/g, "")) || 0)} />
        </div>
        <button disabled={busy || amount <= 0 || amount > inVault} className="mt-1.5 rounded-xl border border-forest px-4 py-2.5 font-semibold text-forest hover:bg-mint disabled:opacity-40">Pay tax from vault</button>
      </form>
      <p className="mt-3 text-xs text-muted">Available: {formatNaira(inVault)}</p>
      <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-4 text-sm font-semibold text-leaf">
        <Link href="/filing">Filing checklist →</Link>
        <Link href="/reports">Download report →</Link>
      </div>
    </section>
  );
}
