import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Code2, Handshake, ShieldCheck, Users } from "lucide-react";
import { compliance } from "@/config/compliance";

export const metadata: Metadata = { title: "For savings partners | Tax Dey" };

export default function PartnersPage() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-14">
        <p className="text-sm font-bold uppercase tracking-[.18em] text-leaf">For banks, savings platforms and fund managers</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">Savings with a deadline built in.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          From 2026, freelancers, creators, traders and small companies are squarely inside Nigeria’s tax net. Most of them have never set money aside for it.
          Tax Dey turns every payment they receive into a reason to save, and sends that money to your platform.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 sm:grid-cols-3">
        <Card icon={Clock3} title="Deposits that stay" body="Tax savings have a known end date (31 March for individuals). Balances build all year instead of leaving at month end." />
        <Card icon={Users} title="Customers you don't reach today" body="Informal earners and first-time savers who come in through a free tax calculator, in English and Pidgin." />
        <Card icon={ShieldCheck} title="You stay in control" body="You own KYC, custody and payouts. Tax Dey is a technology layer and never holds funds." />
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-5">
        <h2 className="text-3xl font-bold">How the integration works</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ol className="space-y-4 text-sm leading-6">
            {[
              ["Customer signs up on Tax Dey", "We pass them to your onboarding and KYC. They become your customer, with a vault in their own name."],
              ["Money lands, Tax Dey calculates", "Our engine applies the 2026 personal, presumptive, company and VAT rules to each payment."],
              ["Customer confirms the move", "One tap sends a deposit instruction with an idempotency key and confirmation record."],
              ["You hold, report and pay out", "Your reference comes back to us and is stored in an append-only ledger."],
            ].map(([title, body], index) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest font-bold text-gold">{index + 1}</span>
                <div><p className="font-bold">{title}</p><p className="text-muted">{body}</p></div>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl bg-forest p-5 text-sm text-white">
            <p className="flex items-center gap-2 font-semibold text-gold"><Code2 size={16} /> Partner adapter contract</p>
            <pre className="mt-3 overflow-x-auto text-xs leading-6 text-white/85">{`interface SavingsPartnerAdapter {
  openVault(customer): { vaultRef }
  deposit({ vaultRef, amount,
            idempotencyKey,
            customerConfirmation })
    → { partnerRef, status }
  withdraw({ ..., reason:
            "tax-payment" | "withdrawal" })
    → { partnerRef, status }
}`}</pre>
            <p className="mt-3 text-white/70">A new partner is one adapter file. The rest of the app does not change.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-5">
        <h2 className="text-3xl font-bold">Business model</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Model title="Free for users" body="Tax calculator, set-aside guidance and reminders. This is how people find us." />
          <Model title="Partner revenue share" body="A referral or balance-based fee from the savings partner. Never charged on the customer's savings." />
          <Model title="Filing Ready pack" body="A once-a-year paid pack: records, computation and handoff to a registered tax practitioner." />
          <Model title="Teams and associations" body="Employers, cooperatives and market associations that want their members tax-ready." />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-5">
        <div className="flex flex-col gap-6 rounded-3xl bg-gold-soft p-8 sm:flex-row sm:items-center sm:p-10">
          <Handshake size={40} className="shrink-0 text-clay" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Compliance first</h2>
            <p className="mt-2 leading-7 text-ink/80">
              Tax Dey holds no customer funds and enables only savings products ({compliance.allowedVaultProducts.join(", ")}) until counsel signs off on anything else.
              Every disclosure and feature switch lives in one config, so changes you or your lawyers request ship quickly.
            </p>
          </div>
          <Link href="/trust" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-forest px-5 py-3 font-semibold text-white">See the model <ArrowRight size={16} /></Link>
        </div>
        <p className="mt-6 text-center text-sm text-muted">Want to see it work? <Link href="/vault" className="font-semibold text-leaf underline">Open the demo vault</Link> and tap “Load sample year”.</p>
      </section>
    </main>
  );
}

function Card({ icon: Icon, title, body }: { icon: typeof Clock3; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <Icon className="text-leaf" size={22} />
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}

function Model({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
