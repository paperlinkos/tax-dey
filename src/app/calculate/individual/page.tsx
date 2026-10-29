"use client";

import { CalculatorForm } from "@/components/calculator-form";
import { useLanguage } from "@/components/language-provider";

export default function IndividualCalculatorPage() {
  const { t } = useLanguage();
  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-leaf">2026 · Tax Dey</p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{t.calculator}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{t.calculatorIntro}</p>
      <div className="mt-9"><CalculatorForm /></div>
    </main>
  );
}
