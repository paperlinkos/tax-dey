import type { SetAsideLine, TaxProfile } from "@/lib/setaside/types";

export type IncomeStatus = "pending" | "moved" | "skipped";

export type IncomeEvent = {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  receivedOn: string;
  amount: number;
  source: string;
  setAside: number;
  breakdown: SetAsideLine[];
  status: IncomeStatus;
};

export type VaultMoveKind = "deposit" | "tax-payment" | "withdrawal";

export type VaultMove = {
  id: string;
  kind: VaultMoveKind;
  amount: number;
  at: string;
  incomeId?: string;
  /** Reference returned by the savings partner; proves the money moved at their end. */
  partnerRef: string;
  note?: string;
};

export type VaultState = {
  taxYear: number;
  partnerId: string;
  profile: TaxProfile | null;
  income: IncomeEvent[];
  moves: VaultMove[];
};

export type NewIncome = { receivedOn: string; amount: number; source: string };
