import type { Metadata } from "next";
import { ArrowRight, Ban, CheckCircle2, Landmark, Smartphone, UserRound } from "lucide-react";
import { compliance } from "@/config/compliance";
import { partnerById, partners } from "@/config/partners";
import { ALL_RULE_REVIEWS } from "@/lib/tax/rules";

export const metadata: Metadata = { title: "How your money is held | Tax Dey" };

const STATUS_LABEL = { sandbox: "Demo only", prospect: "Prospective", "in-discussion": "In discussion", "contract-signed": "Contract signed", live: "Live" } as const;

/** Everything on this page is read from src/config, so it changes when the compliance settings change. */
export default function TrustPage() {
  const active = partnerById(compliance.activePartnerId);
  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-leaf">Is my money safe?</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">Tax Dey does the maths. A licensed partner holds the money.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{compliance.disclosures.custody}</p>

      <section className="mt-12 grid items-stretch gap-3 rounded-3xl border border-line bg-white p-6 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:p-8">
        <Node icon={UserRound} title="You" body="Your bank account or wallet, where your income lands." />
        <ArrowRight className="mx-auto self-center rotate-90 text-muted sm:rotate-0" />
        <Node icon={Smartphone} title="Tax Dey app" body="Works out the tax and asks you to confirm. Sends your instruction. Never touches the money." highlight />
        <ArrowRight className="mx-auto self-center rotate-90 text-muted sm:rotate-0" />
        <Node icon={Landmark} title={active?.name ?? "Licensed partner"} body="Holds your tax vault in your name, does identity checks, pays out to you." />
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        <List title="What Tax Dey does" icon={CheckCircle2} tone="text-leaf" items={[
          "Calculates the tax inside each payment using the 2026 rules",
          "Shows you how much to move and when your deadlines are",
          "Sends a move to your partner vault only after you tap to confirm",
          "Keeps a record of every estimate and every partner confirmation",
        ]} />
        <List title="What Tax Dey never does" icon={Ban} tone="text-clay" items={[
          "Receive your money into a Tax Dey account",
          "Pool customer money or lend it out",
          compliance.features.showReturns ? "Promise a fixed return" : "Advertise interest or investment returns",
          compliance.features.autoSweep ? "Move money outside the mandate you agreed" : "Move money automatically without your tap",
        ]} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Savings partners</h2>
        <p className="mt-2 text-muted">The vault runs on one partner at a time. Status is updated as agreements are signed.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-muted"><tr><th className="p-4 font-medium">Partner</th><th className="p-4 font-medium">Regulator</th><th className="p-4 font-medium">Product</th><th className="p-4 font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {partners.map((partner) => (
                <tr key={partner.id} className={partner.id === compliance.activePartnerId ? "bg-mint/40" : ""}>
                  <td className="p-4 font-semibold">{partner.name}{partner.id === compliance.activePartnerId && <span className="ml-2 text-xs font-medium text-leaf">active</span>}</td>
                  <td className="p-4 text-muted">{partner.regulator}</td>
                  <td className="p-4 text-muted">{partner.product === "savings-deposit" ? "Savings" : "Money market fund"}{!compliance.allowedVaultProducts.includes(partner.product) && " (not enabled)"}</td>
                  <td className="p-4">{STATUS_LABEL[partner.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">The tax rules we use</h2>
        <p className="mt-2 text-muted">Every rule names its source. Rules marked for review use the cautious value, so you save a little more rather than less.</p>
        <ul className="mt-5 grid gap-3">
          {ALL_RULE_REVIEWS.map(({ name, review }) => (
            <li key={name} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">{name}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${review.verificationStatus === "implemented" ? "bg-mint text-forest" : "bg-gold-soft text-clay"}`}>{review.verificationStatus === "implemented" ? "Implemented" : "Awaiting legal review"}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{review.legalSource}: {review.reference}</p>
              {review.note && <p className="mt-2 text-sm">{review.note}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl bg-paper p-6 text-sm leading-6 ring-1 ring-line">
        <h2 className="text-lg font-bold">Compliance log</h2>
        <ul className="mt-3 space-y-2">
          {compliance.reviewLog.map((entry) => (
            <li key={entry.date + entry.change}><span className="tabular text-muted">{entry.date}</span> · {entry.change} <em className="text-muted">({entry.status === "approved" ? `approved by ${entry.by}` : "awaiting legal review"})</em></li>
          ))}
        </ul>
        <p className="mt-4 text-muted">{compliance.disclosures.partnerRevenue} {compliance.disclosures.notAdvice}</p>
      </section>
    </main>
  );
}

function Node({ icon: Icon, title, body, highlight }: { icon: typeof Landmark; title: string; body: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? "bg-forest text-white" : "bg-paper"}`}>
      <Icon size={22} className={highlight ? "text-gold" : "text-leaf"} />
      <p className="mt-3 font-display text-lg font-bold">{title}</p>
      <p className={`mt-1 text-sm leading-6 ${highlight ? "text-white/75" : "text-muted"}`}>{body}</p>
    </div>
  );
}

function List({ title, icon: Icon, tone, items }: { title: string; icon: typeof Ban; tone: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6">
        {items.map((item) => <li key={item} className="flex gap-2.5"><Icon size={17} className={`mt-1 shrink-0 ${tone}`} />{item}</li>)}
      </ul>
    </div>
  );
}
