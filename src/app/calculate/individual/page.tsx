"use client";

import { CalculatorForm } from "@/components/calculator-form";
import { useLanguage } from "@/components/language-provider";

export default function IndividualCalculatorPage() { const { t } = useLanguage(); return <main className="mx-auto max-w-6xl px-5 py-14"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-800">2026 · Tax De</p><h1 className="mt-3 text-3xl font-bold">{t.calculator}</h1><p className="mt-3 max-w-2xl text-stone-600">{t.estimateNotice}</p><div className="mt-9"><CalculatorForm/></div></main>; }
