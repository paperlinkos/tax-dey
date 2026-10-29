import type { Metadata } from "next";
import { VaultApp } from "@/components/vault/vault-app";

export const metadata: Metadata = { title: "Tax vault | Tax Dey" };

export default function VaultPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-leaf">Tax vault</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Money in. Tax aside. No wahala.</h1>
      <div className="mt-8">
        <VaultApp />
      </div>
    </main>
  );
}
