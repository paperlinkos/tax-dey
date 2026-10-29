import { liabilityToDate, setAsideForPayment } from "@/lib/setaside/engine";
import type { SetAsideLine, TaxProfile } from "@/lib/setaside/types";
import type { IncomeEvent, NewIncome, VaultState } from "./types";

/**
 * Pure state changes for the vault. The browser demo and the database-backed API
 * both use these, so the numbers are identical wherever the vault is stored.
 */

const byDate = (a: IncomeEvent, b: IncomeEvent) => a.receivedOn.localeCompare(b.receivedOn) || a.id.localeCompare(b.id);

/**
 * Recompute set-asides for pending payments in date order. Moved and skipped payments
 * keep their numbers: the money has either moved or the user chose not to.
 */
export function recalculate(profile: TaxProfile, income: IncomeEvent[]): IncomeEvent[] {
  let receivedSoFar = 0;
  return [...income].sort(byDate).map((event) => {
    const next = event.status === "pending" ? withSetAside(profile, receivedSoFar, event) : event;
    receivedSoFar += event.amount;
    return next;
  });
}

function withSetAside(profile: TaxProfile, receivedSoFar: number, event: IncomeEvent): IncomeEvent {
  const result = setAsideForPayment(profile, receivedSoFar, event.amount);
  return { ...event, setAside: result.total, breakdown: result.lines };
}

export function validateIncome(input: NewIncome, taxYear: number): string | null {
  if (!Number.isFinite(input.amount) || input.amount <= 0) return "Enter how much you received.";
  if (input.amount > 1_000_000_000_000) return "That amount is too large.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.receivedOn)) return "Choose the date you were paid.";
  if (Number(input.receivedOn.slice(0, 4)) !== taxYear) return `Only ${taxYear} income can go in this vault.`;
  if (input.source.trim().length > 120) return "Keep the description short.";
  return null;
}

export function addIncome(state: VaultState, input: NewIncome, id: string): VaultState {
  if (!state.profile) throw new Error("Set up your tax profile first.");
  const error = validateIncome(input, state.taxYear);
  if (error) throw new Error(error);
  const event: IncomeEvent = { id, receivedOn: input.receivedOn, amount: input.amount, source: input.source.trim() || "Payment", setAside: 0, breakdown: [], status: "pending" };
  return { ...state, income: recalculate(state.profile, [...state.income, event]) };
}

export type VaultSummary = {
  received: number;
  owedSoFar: number;
  owedLines: SetAsideLine[];
  inVault: number;
  /** Positive when the vault is short of what is owed so far. */
  gap: number;
  coverage: number;
  pendingCount: number;
  pendingAmount: number;
};

export function summarise(state: VaultState): VaultSummary {
  const received = state.income.reduce((total, event) => total + event.amount, 0);
  const owedLines = state.profile ? liabilityToDate(state.profile, received).lines : [];
  const owedSoFar = Math.ceil(owedLines.reduce((total, line) => total + line.amount, 0));
  const inVault = state.moves.reduce((total, move) => total + (move.kind === "deposit" ? move.amount : -move.amount), 0);
  const pending = state.income.filter((event) => event.status === "pending" && event.setAside > 0);
  return {
    received,
    owedSoFar,
    owedLines,
    inVault,
    gap: Math.max(0, owedSoFar - inVault),
    coverage: owedSoFar === 0 ? 1 : Math.min(1, inVault / owedSoFar),
    pendingCount: pending.length,
    pendingAmount: pending.reduce((total, event) => total + event.setAside, 0),
  };
}
