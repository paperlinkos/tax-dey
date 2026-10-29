import { SUPPORTED_TAX_YEAR } from "@/lib/tax/rules";
import { DEFAULT_PROFILE } from "@/lib/setaside/types";
import { applyAction, emptyVault, type VaultAction } from "./actions";
import { sandboxPartner } from "./partner";
import type { VaultState } from "./types";

export interface VaultClient {
  mode: "account" | "demo";
  load(): Promise<VaultState>;
  act(action: VaultAction): Promise<VaultState>;
}

export const accountVault: VaultClient = {
  mode: "account",
  async load() {
    const response = await fetch("/api/vault");
    if (!response.ok) throw new Error("Your vault could not be loaded.");
    return response.json();
  },
  async act(action) {
    const response = await fetch("/api/vault", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(action) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
    return body;
  },
};

const DEMO_KEY = `tax-dey-demo-vault-${SUPPORTED_TAX_YEAR}`;

function readDemo(): VaultState {
  try {
    const saved = window.localStorage.getItem(DEMO_KEY);
    if (saved) return JSON.parse(saved) as VaultState;
  } catch {
    // Private mode or corrupted data: start fresh.
  }
  return emptyVault(SUPPORTED_TAX_YEAR);
}

function writeDemo(state: VaultState) {
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable: the demo still works for this page view.
  }
}

/** Browser-only vault with the sandbox partner. Same rules as the real vault, no money. */
export const demoVault: VaultClient & { reset(): VaultState; loadSample(): Promise<VaultState> } = {
  mode: "demo",
  async load() {
    return readDemo();
  },
  async act(action) {
    const next = await applyAction(readDemo(), action, sandboxPartner, () => crypto.randomUUID(), new Date());
    writeDemo(next);
    return next;
  },
  reset() {
    const state = emptyVault(SUPPORTED_TAX_YEAR);
    writeDemo(state);
    return state;
  },
  /** A believable freelancer's year so far, for pitches and walkthroughs. */
  async loadSample() {
    writeDemo(emptyVault(SUPPORTED_TAX_YEAR));
    const year = SUPPORTED_TAX_YEAR;
    await demoVault.act({ type: "set-profile", profile: { ...DEFAULT_PROFILE.freelancer, profitMargin: 0.85 } });
    const payments: [string, number, string][] = [
      [`${year}-01-14`, 450_000, "Logo design, Adaeze Foods"],
      [`${year}-02-03`, 620_000, "Upwork payout"],
      [`${year}-03-21`, 380_000, "Brand deal, Instagram"],
      [`${year}-05-09`, 1_150_000, "Website build, Lagos clinic"],
      [`${year}-07-02`, 540_000, "Upwork payout"],
      [`${year}-09-18`, 900_000, "Retainer, fintech client"],
    ];
    let state = readDemo();
    for (const [receivedOn, amount, source] of payments) state = await demoVault.act({ type: "add-income", income: { receivedOn, amount, source } });
    // Move the first few so the dashboard shows progress and one gap.
    for (const event of state.income.slice(0, 4)) if (event.setAside > 0) state = await demoVault.act({ type: "move", incomeId: event.id });
    return state;
  },
};
