"use client";

import { BusinessAssessment } from "@/components/business-assessment";
import { useLanguage } from "@/components/language-provider";

export default function BusinessPage() { const { t } = useLanguage(); return <main className="px-5 py-14"><div className="mx-auto max-w-4xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-800">2026 · Tax Dey</p><h1 className="mt-3 text-3xl font-bold">{t.businessAssessment}</h1><p className="mt-3 max-w-2xl text-stone-600">{t.estimateNotice}</p><div className="mt-8"><BusinessAssessment/></div></div></main>; }
