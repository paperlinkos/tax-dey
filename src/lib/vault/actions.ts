import { z } from "zod";
import { compliance } from "@/config/compliance";
import { addIncome, recalculate, summarise } from "./ledger";
import type { SavingsPartnerAdapter } from "./partner";
import type { VaultMove, VaultState } from "./types";

const money = z.number().finite().min(0).max(1_000_000_000_000);

export const profileSchema = z.object({
  segment: z.enum(["salary", "freelancer", "trader", "company"]),
  payeHandledByEmployer: z.boolean(),
  annualSalary: money,
  qualifyingAnnualRent: money,
  profitMargin: z.number().min(0).max(1),
  keepsRecords: z.boolean(),
  expectedAnnualTurnover: money,
  hasFixedPremises: z.boolean(),
  hasEmployees: z.boolean(),
  totalFixedAssets: money,
  providesProfessionalServices: z.boolean(),
  chargesVat: z.boolean(),
  bufferRate: z.number().min(0).max(0.25),
});

const id = z.string().min(1).max(64);

export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("set-profile"), profile: profileSchema }),
  z.object({ type: z.literal("add-income"), income: z.object({ receivedOn: z.string().max(10), amount: money.positive(), source: z.string().max(120) }) }),
  z.object({ type: z.literal("move"), incomeId: id }),
  z.object({ type: z.literal("skip"), incomeId: id }),
  z.object({ type: z.literal("remove-income"), incomeId: id }),
  z.object({ type: z.literal("withdraw"), amount: money.positive(), reason: z.enum(["tax-payment", "withdrawal"]) }),
]);

export type VaultAction = z.infer<typeof actionSchema>;

export class VaultActionError extends Error {}

/**
 * Apply one user action to the vault. Money only moves through the partner adapter
 * and only for an action the user just confirmed in the app.
 */
export async function applyAction(state: VaultState, action: VaultAction, partner: SavingsPartnerAdapter, newId: () => string, now: Date): Promise<VaultState> {
  switch (action.type) {
    case "set-profile":
      return { ...state, profile: action.profile, income: recalculate(action.profile, state.income) };

    case "add-income":
      try {
        return addIncome(state, action.income, newId());
      } catch (error) {
        throw new VaultActionError((error as Error).message);
      }

    case "move": {
      const event = state.income.find((item) => item.id === action.incomeId);
      if (!event) throw new VaultActionError("Payment not found.");
      if (event.status !== "pending") throw new VaultActionError("This payment has already been handled.");
      if (event.setAside <= 0) throw new VaultActionError("Nothing to set aside for this payment.");
      const result = await partner.deposit({ vaultRef: state.partnerId, amount: event.setAside, idempotencyKey: `move-${event.id}`, customerConfirmation: `confirmed-in-app:${now.toISOString()}` });
      const move: VaultMove = { id: newId(), kind: "deposit", amount: event.setAside, at: now.toISOString(), incomeId: event.id, partnerRef: result.partnerRef };
      return { ...state, income: state.income.map((item) => (item.id === event.id ? { ...item, status: "moved" } : item)), moves: [...state.moves, move] };
    }

    case "skip": {
      const event = state.income.find((item) => item.id === action.incomeId);
      if (!event || event.status !== "pending") throw new VaultActionError("Payment not found.");
      return { ...state, income: state.income.map((item) => (item.id === event.id ? { ...item, status: "skipped" } : item)) };
    }

    case "remove-income": {
      const event = state.income.find((item) => item.id === action.incomeId);
      if (!event) throw new VaultActionError("Payment not found.");
      if (event.status === "moved") throw new VaultActionError("Money for this payment is already in your vault, so it can't be deleted.");
      const income = state.income.filter((item) => item.id !== event.id);
      return { ...state, income: state.profile ? recalculate(state.profile, income) : income };
    }

    case "withdraw": {
      const { inVault } = summarise(state);
      if (action.amount > inVault) throw new VaultActionError("That is more than is in your vault.");
      const key = newId();
      const result = await partner.withdraw({ vaultRef: state.partnerId, amount: action.amount, idempotencyKey: key, customerConfirmation: `confirmed-in-app:${now.toISOString()}`, reason: action.reason });
      const move: VaultMove = { id: key, kind: action.reason, amount: action.amount, at: now.toISOString(), partnerRef: result.partnerRef };
      return { ...state, moves: [...state.moves, move] };
    }
  }
}

export const emptyVault = (taxYear: number): VaultState => ({ taxYear, partnerId: compliance.activePartnerId, profile: null, income: [], moves: [] });
