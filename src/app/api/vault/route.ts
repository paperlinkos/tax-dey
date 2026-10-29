import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SUPPORTED_TAX_YEAR } from "@/lib/tax/rules";
import { actionSchema, applyAction, VaultActionError } from "@/lib/vault/actions";
import { getPartner } from "@/lib/vault/partner";
import { loadVault, persistVault } from "@/lib/vault/server";

async function ownerId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const owner = await ownerId();
  if (!owner) return NextResponse.json({ error: "Sign in to use your vault." }, { status: 401 });
  const { state } = await loadVault(owner, SUPPORTED_TAX_YEAR);
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const owner = await ownerId();
  if (!owner) return NextResponse.json({ error: "Sign in to use your vault." }, { status: 401 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That request was not valid." }, { status: 400 });

  try {
    const state = await db.$transaction(async (tx) => {
      const { vaultId, state: before } = await loadVault(owner, SUPPORTED_TAX_YEAR, tx);
      const after = await applyAction(before, parsed.data, getPartner(before.partnerId), () => crypto.randomUUID(), new Date());
      await persistVault(tx, vaultId, before, after);
      return after;
    });
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof VaultActionError) return NextResponse.json({ error: error.message }, { status: 422 });
    throw error;
  }
}
