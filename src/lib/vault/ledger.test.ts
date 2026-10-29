import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE } from "@/lib/setaside/types";
import { addIncome, recalculate, summarise } from "./ledger";
import { deadlinesFor } from "./deadlines";
import type { VaultState } from "./types";

const empty: VaultState = { taxYear: 2026, partnerId: "sandbox", profile: { ...DEFAULT_PROFILE.freelancer, profitMargin: 1, bufferRate: 0 }, income: [], moves: [] };

describe("vault ledger", () => {
  it("computes each set-aside from the payments before it", () => {
    let state = addIncome(empty, { receivedOn: "2026-02-01", amount: 800_000, source: "Client A" }, "a");
    state = addIncome(state, { receivedOn: "2026-03-01", amount: 200_000, source: "Client B" }, "b");
    expect(state.income.map((event) => event.setAside)).toEqual([0, 30_000]);
  });

  it("re-orders by date when an earlier payment is added later", () => {
    let state = addIncome(empty, { receivedOn: "2026-05-01", amount: 200_000, source: "Late" }, "late");
    state = addIncome(state, { receivedOn: "2026-01-10", amount: 800_000, source: "Early" }, "early");
    expect(state.income.find((event) => event.id === "late")?.setAside).toBe(30_000);
    expect(state.income.find((event) => event.id === "early")?.setAside).toBe(0);
  });

  it("does not change payments that were already moved", () => {
    const state = addIncome(empty, { receivedOn: "2026-02-01", amount: 1_000_000, source: "A" }, "a");
    const moved = { ...state, income: state.income.map((event) => ({ ...event, status: "moved" as const })) };
    const changed = recalculate({ ...empty.profile!, profitMargin: 0.5 }, moved.income);
    expect(changed[0].setAside).toBe(state.income[0].setAside);
  });

  it("rejects income from another tax year", () => {
    expect(() => addIncome(empty, { receivedOn: "2025-12-31", amount: 1, source: "" }, "x")).toThrow("2026");
  });

  it("summarises what is owed against what is in the vault", () => {
    const state = addIncome(empty, { receivedOn: "2026-02-01", amount: 3_000_000, source: "A" }, "a");
    const summary = summarise({ ...state, moves: [{ id: "m", kind: "deposit", amount: 300_000, at: "2026-02-01", partnerRef: "x" }] });
    expect(summary.owedSoFar).toBe(330_000);
    expect(summary.inVault).toBe(300_000);
    expect(summary.gap).toBe(30_000);
    expect(summary.pendingCount).toBe(1);
  });

  it("lists VAT and company deadlines for companies that charge VAT", () => {
    const list = deadlinesFor("company", 2026, true, new Date("2026-10-29T00:00:00Z"));
    expect(list.map((deadline) => deadline.date)).toEqual(["2026-11-21", "2027-06-30"]);
  });
});
