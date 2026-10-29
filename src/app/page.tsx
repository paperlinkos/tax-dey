"use client";

import Link from "next/link";
import { ArrowRight, BellRing, Calculator, FileCheck2, Landmark, LockKeyhole, Wallet } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatNaira } from "@/components/money";
import { compliance } from "@/config/compliance";
import { setAsideForPayment } from "@/lib/setaside/engine";
import { DEFAULT_PROFILE, SEGMENT_LABELS, type Segment } from "@/lib/setaside/types";

// A worked example computed by the real engine, so the homepage never shows made-up maths.
const EXAMPLE_PAYMENT = 500_000;
const EXAMPLE = setAsideForPayment({ ...DEFAULT_PROFILE.freelancer, profitMargin: 0.85, bufferRate: 0 }, 2_400_000, EXAMPLE_PAYMENT);

export default function Home() {
  const { t } = useLanguage();
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-sm font-semibold text-forest">Built for the Nigeria Tax Act 2025</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] text-forest sm:text-6xl">{t.heroVault}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{t.introVault}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vault" className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3.5 font-semibold text-white hover:bg-leaf">{t.ctaVault} <ArrowRight size={18} /></Link>
            <Link href="/calculate" className="inline-flex items-center gap-2 rounded-xl border border-forest/20 bg-white px-5 py-3.5 font-semibold text-forest hover:border-forest">{t.ctaCalculate}</Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted"><LockKeyhole size={15} className="text-leaf" /> Tax Dey never holds your money. <Link href="/trust" className="font-semibold text-leaf underline">How it works</Link></p>
        </div>

        <PaymentCard />
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">Tax isn’t the problem. Finding the money in March is.</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-4">
            {[
              [Wallet, "Money lands", "A client pays, your shop has a good week, a brand deal clears."],
              [Calculator, "We find the tax in it", "Using the 2026 bands and your year so far, not a guess."],
              [Landmark, "You move it to your vault", "One tap. It goes to a savings account in your name with a licensed partner."],
              [FileCheck2, "Filing day is easy", "The money's there. Pay it, or get help filing from a registered practitioner."],
            ].map(([Icon, title, body], index) => {
              const StepIcon = Icon as typeof Wallet;
              return (
                <li key={title as string}>
                  <span className="grid size-11 place-items-center rounded-2xl bg-mint text-forest"><StepIcon size={20} /></span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-leaf">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-bold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{body as string}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-bold sm:text-4xl">For everyone who earns in Nigeria</h2>
        <p className="mt-3 max-w-2xl text-muted">Each type of earner gets the rules that actually apply to them.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(SEGMENT_LABELS) as Segment[]).map((segment) => (
            <Link key={segment} href="/vault" className="group rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-leaf">
              <h3 className="text-lg font-bold">{SEGMENT_LABELS[segment].title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{SEGMENT_LABELS[segment].example}</p>
              <p className="mt-4 text-sm font-semibold text-leaf">{SEGMENT_RULE[segment]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="grid gap-8 rounded-3xl bg-forest p-8 text-white sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Your money stays your money</h2>
            <p className="mt-4 leading-7 text-white/80">{compliance.disclosures.custody}</p>
            <Link href="/trust" className="mt-6 inline-flex items-center gap-2 font-semibold text-gold">See exactly how it’s held <ArrowRight size={16} /></Link>
          </div>
          <ul className="grid gap-4 text-sm">
            {[
              [LockKeyhole, "Held by a licensed partner, in your name, not pooled with Tax Dey."],
              [BellRing, "Nothing moves without your tap. No surprise debits."],
              [FileCheck2, "Every rule we use shows its legal source and review status."],
            ].map(([Icon, text]) => {
              const ItemIcon = Icon as typeof LockKeyhole;
              return <li key={text as string} className="flex gap-3 rounded-2xl bg-white/5 p-4"><ItemIcon size={18} className="mt-0.5 shrink-0 text-gold" /><span className="leading-6">{text as string}</span></li>;
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <p className="border-l-4 border-gold bg-gold-soft p-4 text-sm leading-6 text-ink">{t.independent} {compliance.disclosures.estimate}</p>
      </section>
    </main>
  );
}

const SEGMENT_RULE: Record<Segment, string> = {
  salary: "PAYE-aware side-income tax",
  freelancer: "2026 personal income tax bands",
  trader: "1% presumptive tax or real profit",
  company: "CIT, 4% development levy and VAT",
};

function PaymentCard() {
  const keep = EXAMPLE_PAYMENT - EXAMPLE.total;
  return (
    <div className="relative">
      <div className="absolute -inset-2 -rotate-2 rounded-[2rem] sm:-inset-4 bg-gold/30" aria-hidden="true" />
      <div className="relative rounded-[1.75rem] border border-line bg-white p-6 shadow-xl shadow-forest/10">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-muted">Payment received</span>
          <span className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-semibold text-forest">Freelancer</span>
        </div>
        <p className="mt-2 font-display text-4xl font-bold tabular">{formatNaira(EXAMPLE_PAYMENT)}</p>
        <p className="text-sm text-muted">Website build, Lagos clinic</p>
        <div className="mt-6 space-y-3">
          <Row label="You keep" value={formatNaira(keep)} width={keep / EXAMPLE_PAYMENT} tone="bg-leaf" />
          <Row label="Tax set aside" value={formatNaira(EXAMPLE.total)} width={EXAMPLE.total / EXAMPLE_PAYMENT} tone="bg-gold" />
        </div>
        <p className="mt-5 rounded-xl bg-paper p-3 text-xs leading-5 text-muted">₦2.4m already earned this year puts this payment in the 15% band. Only 85% is profit after work costs.</p>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-forest px-4 py-3 text-white">
          <span className="text-sm">Move to tax vault</span>
          <span className="font-semibold tabular text-gold">{formatNaira(EXAMPLE.total)} →</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, width, tone }: { label: string; value: string; width: number; tone: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="font-semibold tabular">{value}</span></div>
      <div className="mt-1.5 h-2 rounded-full bg-paper"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(width * 100, 3)}%` }} /></div>
    </div>
  );
}
