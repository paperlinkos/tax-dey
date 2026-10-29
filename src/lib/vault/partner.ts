import { compliance } from "@/config/compliance";

/**
 * Contract every savings partner adapter must meet. Tax Dey only sends instructions
 * the customer has confirmed; the partner holds and moves the money.
 *
 * To connect a real partner: implement this interface in `partners/<id>.ts`, register
 * it in `getPartner`, and set `compliance.activePartnerId`.
 */
export type DepositRequest = {
  vaultRef: string;
  amount: number;
  /** Same key → same deposit; protects against double taps and retries. */
  idempotencyKey: string;
  /** Proof the customer confirmed this move, e.g. "confirmed-in-app:<timestamp>". */
  customerConfirmation: string;
};

export type PartnerResult = { partnerRef: string; status: "confirmed" | "processing" };

export interface SavingsPartnerAdapter {
  id: string;
  openVault(customer: { customerRef: string; name: string }): Promise<{ vaultRef: string }>;
  deposit(request: DepositRequest): Promise<PartnerResult>;
  withdraw(request: DepositRequest & { reason: "tax-payment" | "withdrawal" }): Promise<PartnerResult>;
}

/** Simulated partner: returns predictable references and moves no money. */
export const sandboxPartner: SavingsPartnerAdapter = {
  id: "sandbox",
  async openVault({ customerRef }) {
    return { vaultRef: `SBX-VAULT-${customerRef.slice(0, 8)}` };
  },
  async deposit({ idempotencyKey }) {
    return { partnerRef: `SBX-DEP-${idempotencyKey.slice(0, 10)}`, status: "confirmed" };
  },
  async withdraw({ idempotencyKey }) {
    return { partnerRef: `SBX-WDR-${idempotencyKey.slice(0, 10)}`, status: "confirmed" };
  },
};

export function getPartner(id: string = compliance.activePartnerId): SavingsPartnerAdapter {
  if (compliance.holdsCustomerFunds) throw new Error("Compliance config says Tax Dey holds funds; this build only supports partner-held vaults.");
  switch (id) {
    case "sandbox":
      return sandboxPartner;
    default:
      throw new Error(`Savings partner "${id}" is not connected yet.`);
  }
}
