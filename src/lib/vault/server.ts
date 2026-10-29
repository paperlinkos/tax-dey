import "server-only";
import type { Prisma } from "@prisma/client";
import { compliance } from "@/config/compliance";
import { db } from "@/lib/db";
import type { SetAsideLine, TaxProfile } from "@/lib/setaside/types";
import { profileSchema } from "./actions";
import type { IncomeStatus, VaultMoveKind, VaultState } from "./types";

type Tx = Prisma.TransactionClient;

export async function loadVault(ownerId: string, taxYear: number, tx: Tx = db): Promise<{ vaultId: string; state: VaultState }> {
  const vault = await tx.taxVault.upsert({
    where: { ownerId_taxYear: { ownerId, taxYear } },
    create: { ownerId, taxYear, partnerId: compliance.activePartnerId },
    update: {},
    include: { income: true, moves: { orderBy: { createdAt: "asc" } } },
  });
  const profile = vault.profile ? profileSchema.safeParse(vault.profile) : null;
  return {
    vaultId: vault.id,
    state: {
      taxYear: vault.taxYear,
      partnerId: vault.partnerId,
      profile: profile?.success ? (profile.data as TaxProfile) : null,
      income: vault.income.map((row) => ({
        id: row.id,
        receivedOn: row.receivedOn,
        amount: Number(row.amount),
        source: row.source,
        setAside: Number(row.setAside),
        breakdown: row.breakdown as SetAsideLine[],
        status: row.status as IncomeStatus,
      })),
      moves: vault.moves.map((row) => ({
        id: row.id,
        kind: row.kind as VaultMoveKind,
        amount: Number(row.amount),
        at: row.createdAt.toISOString(),
        incomeId: row.incomeId ?? undefined,
        partnerRef: row.partnerRef,
        note: row.note ?? undefined,
      })),
    },
  };
}

/** Write the difference between two states. Moves are only ever inserted. */
export async function persistVault(tx: Tx, vaultId: string, before: VaultState, after: VaultState) {
  if (JSON.stringify(before.profile) !== JSON.stringify(after.profile)) {
    await tx.taxVault.update({ where: { id: vaultId }, data: { profile: after.profile as Prisma.InputJsonValue } });
  }

  const previous = new Map(before.income.map((event) => [event.id, event]));
  const current = new Set(after.income.map((event) => event.id));

  for (const event of after.income) {
    const old = previous.get(event.id);
    const data = { setAside: event.setAside, breakdown: event.breakdown as Prisma.InputJsonValue, status: event.status };
    if (!old) {
      await tx.vaultIncome.create({ data: { id: event.id, vaultId, receivedOn: event.receivedOn, amount: event.amount, source: event.source, ...data } });
    } else if (old.setAside !== event.setAside || old.status !== event.status) {
      await tx.vaultIncome.update({ where: { id: event.id }, data });
    }
  }
  const removed = before.income.filter((event) => !current.has(event.id)).map((event) => event.id);
  if (removed.length) await tx.vaultIncome.deleteMany({ where: { vaultId, id: { in: removed }, status: { not: "moved" } } });

  const knownMoves = new Set(before.moves.map((move) => move.id));
  for (const move of after.moves.filter((item) => !knownMoves.has(item.id))) {
    await tx.vaultMove.create({ data: { id: move.id, vaultId, kind: move.kind, amount: move.amount, incomeId: move.incomeId, partnerRef: move.partnerRef, note: move.note } });
  }
}
