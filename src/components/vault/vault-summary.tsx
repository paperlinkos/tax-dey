import { CalendarClock, ShieldCheck } from "lucide-react";
import { daysUntil, type TaxDeadline } from "@/lib/vault/deadlines";
import type { VaultSummary } from "@/lib/vault/ledger";
import { formatNaira } from "../money";

export function VaultSummaryPanel({ summary, deadlines, partnerName }: { summary: VaultSummary; deadlines: TaxDeadline[]; partnerName: string }) {
  const today = new Date();
  const percent = Math.round(summary.coverage * 100);
  return (
    <section className="overflow-hidden rounded-3xl bg-forest text-white">
      <div className="grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
        <Stat label="In your tax vault" value={formatNaira(summary.inVault)} emphasis />
        <Stat label="Estimated tax so far" value={formatNaira(summary.owedSoFar)} />
        <Stat label={summary.gap > 0 ? "Still to set aside" : "You're covered"} value={summary.gap > 0 ? formatNaira(summary.gap) : "✓"} tone={summary.gap > 0 ? "gold" : "mint"} />
      </div>
      <div className="px-6 sm:px-8">
        <div className="h-2.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tax covered">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-sm text-white/70">{percent}% of your tax so far is set aside · {formatNaira(summary.received)} received this year</p>
      </div>
      <div className="mt-6 grid gap-px bg-white/10 sm:grid-cols-2">
        <div className="bg-forest p-6 sm:px-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-gold"><CalendarClock size={16} /> Coming up</p>
          <ul className="mt-3 space-y-2 text-sm">
            {deadlines.map((deadline) => (
              <li key={deadline.label} className="flex justify-between gap-4">
                <span>{deadline.label}{deadline.needsReview && <span className="text-white/50"> *</span>}</span>
                <span className="shrink-0 tabular text-white/70">{daysUntil(deadline.date, today)} days</span>
              </li>
            ))}
          </ul>
          {deadlines.some((deadline) => deadline.needsReview) && <p className="mt-2 text-xs text-white/50">* Common date; confirm with your tax adviser.</p>}
        </div>
        <div className="bg-forest p-6 sm:px-8">
          <p className="flex items-center gap-2 text-sm font-semibold text-gold"><ShieldCheck size={16} /> Where the money is</p>
          <p className="mt-3 text-sm leading-6 text-white/80">In a vault in your name with <strong className="text-white">{partnerName}</strong>. Tax Dey can’t spend or move it without you.</p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, emphasis, tone }: { label: string; value: string; emphasis?: boolean; tone?: "gold" | "mint" }) {
  return (
    <div>
      <p className="text-sm text-white/70">{label}</p>
      <p className={`mt-1 font-display font-bold tabular ${emphasis ? "text-4xl" : "text-2xl sm:mt-3"} ${tone === "gold" ? "text-gold" : tone === "mint" ? "text-mint" : ""}`}>{value}</p>
    </div>
  );
}
