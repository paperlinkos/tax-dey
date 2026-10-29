import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { formatNaira } from "@/components/money";
import { auth } from "@/lib/auth";
import { SUPPORTED_TAX_YEAR } from "@/lib/tax/rules";
import { summarise } from "@/lib/vault/ledger";
import { loadVault } from "@/lib/vault/server";

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { state } = await loadVault(session.user.id, SUPPORTED_TAX_YEAR);
  const summary = summarise(state);

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>
        <LogoutButton />
      </div>
      <Link href="/vault" className="mt-8 block rounded-3xl bg-forest p-6 text-white transition hover:bg-leaf sm:p-8">
        <p className="text-sm text-white/70">Your {state.taxYear} tax vault</p>
        {state.profile ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div><p className="text-sm text-white/70">In vault</p><p className="font-display text-3xl font-bold">{formatNaira(summary.inVault)}</p></div>
            <div><p className="text-sm text-white/70">Tax so far</p><p className="font-display text-2xl font-bold">{formatNaira(summary.owedSoFar)}</p></div>
            <div><p className="text-sm text-white/70">Waiting to move</p><p className="font-display text-2xl font-bold text-gold">{formatNaira(summary.pendingAmount)}</p></div>
          </div>
        ) : (
          <p className="mt-2 font-display text-2xl font-bold">Set up your vault →</p>
        )}
      </Link>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[["/calculate", "Calculate my tax"], ["/filing", "Filing checklist"], ["/settings", "Account settings"]].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-2xl border border-line bg-white p-5 font-semibold hover:border-leaf">{label} →</Link>
        ))}
      </div>
    </main>
  );
}
