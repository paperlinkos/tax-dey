"use client";

import { Trash2 } from "lucide-react";
import type { IncomeEvent, VaultMove } from "@/lib/vault/types";
import { formatNaira } from "../money";

const STATUS: Record<IncomeEvent["status"], { label: string; className: string }> = {
  pending: { label: "To move", className: "bg-gold-soft text-clay" },
  moved: { label: "In vault", className: "bg-mint text-forest" },
  skipped: { label: "Skipped", className: "bg-paper text-muted" },
};

const dateLabel = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

export function PendingMoves({ income, onMove, onSkip, busy }: { income: IncomeEvent[]; onMove: (id: string) => void; onSkip: (id: string) => void; busy: boolean }) {
  const pending = income.filter((event) => event.status === "pending" && event.setAside > 0);
  if (!pending.length) return null;
  return (
    <section className="rounded-2xl border-2 border-gold bg-gold-soft/60 p-5">
      <h2 className="text-lg font-bold">Ready to move</h2>
      <p className="text-sm text-muted">Each move goes from you to your vault. Nothing moves until you tap.</p>
      <ul className="mt-4 space-y-3">
        {pending.map((event) => (
          <li key={event.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{event.source}</p>
              <p className="text-sm text-muted">{dateLabel(event.receivedOn)} · {formatNaira(event.amount)} received</p>
            </div>
            <button disabled={busy} onClick={() => onSkip(event.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-paper disabled:opacity-50">Not now</button>
            <button disabled={busy} onClick={() => onMove(event.id)} className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-leaf disabled:opacity-50">Move {formatNaira(event.setAside)}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function History({ income, moves, onRemove, busy }: { income: IncomeEvent[]; moves: VaultMove[]; onRemove: (id: string) => void; busy: boolean }) {
  const withdrawals = moves.filter((move) => move.kind !== "deposit");
  if (!income.length && !withdrawals.length) return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">No payments yet. Log your first one above.</p>;
  const rows = [...income].sort((a, b) => b.receivedOn.localeCompare(a.receivedOn));
  return (
    <section className="rounded-2xl border border-line bg-white">
      <h2 className="border-b border-line px-5 py-4 text-lg font-bold">This year</h2>
      <ul className="divide-y divide-line">
        {withdrawals.map((move) => (
          <li key={move.id} className="flex items-center gap-3 px-5 py-3.5 text-sm">
            <span className="w-14 shrink-0 text-muted">{dateLabel(move.at)}</span>
            <span className="flex-1 font-medium">{move.kind === "tax-payment" ? "Paid tax from vault" : "Withdrawn from vault"}</span>
            <span className="tabular font-semibold text-clay">−{formatNaira(move.amount)}</span>
          </li>
        ))}
        {rows.map((event) => (
          <li key={event.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3.5 text-sm">
            <span className="w-14 shrink-0 text-muted">{dateLabel(event.receivedOn)}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{event.source}</span>
            <span className="tabular text-muted">{formatNaira(event.amount)}</span>
            <span className="w-24 text-right tabular font-semibold">{event.setAside > 0 ? formatNaira(event.setAside) : "₦0"}</span>
            {event.setAside > 0 || event.status !== "pending"
              ? <span className={`w-20 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${STATUS[event.status].className}`}>{STATUS[event.status].label}</span>
              : <span className="w-20 rounded-full bg-paper px-2 py-0.5 text-center text-xs font-semibold text-muted">Tax-free</span>}
            {event.status !== "moved" ? (
              <button disabled={busy} onClick={() => onRemove(event.id)} aria-label={`Delete ${event.source}`} className="rounded p-1 text-muted hover:text-clay disabled:opacity-50"><Trash2 size={15} /></button>
            ) : <span className="w-[23px]" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
