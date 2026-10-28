"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe2, Landmark } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { languageOptions } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  return <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-emerald-900"><span className="grid size-9 place-items-center rounded-lg bg-emerald-800 text-white"><Landmark size={20}/></span>Tax De</Link>
    <nav aria-label="Main navigation" className="hidden gap-5 text-sm font-medium text-stone-600 sm:flex"><Link href="/">{t.home}</Link><Link href="/calculate">{t.calculate}</Link><Link href="/save">Save</Link><Link href="/filing">Filing</Link><Link href="/learn">{t.learn}</Link></nav>
    <LanguageSwitcher language={language} setLanguage={setLanguage} label={t.language}/>
  </div></header>;
}

function LanguageSwitcher({ language, setLanguage, label }: { language: "en" | "pcm"; setLanguage: (language: "en" | "pcm") => void; label: string }) {
  const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null); const button = useRef<HTMLButtonElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } }; document.addEventListener("mousedown", close); document.addEventListener("keydown", escape); return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); }; }, []);
  const choose = (value: "en" | "pcm") => { setLanguage(value); setOpen(false); button.current?.focus(); };
  return <div ref={root} className="relative"><button ref={button} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs font-bold text-stone-700 shadow-sm transition hover:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"><Globe2 size={15}/><span>{language === "en" ? "EN" : "PG"}</span><ChevronDown size={14} aria-hidden="true"/></button>{open && <div role="menu" aria-label={label} className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg"><div className="px-3 py-2 text-xs text-stone-500">Choose language</div>{languageOptions.map((option) => <button role="menuitemradio" aria-checked={option.value === language} key={option.value} onClick={() => choose(option.value)} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const next = option.value === "en" ? "pcm" : "en"; choose(next); setOpen(true); } }} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none">{option.label}{option.value === language && <Check size={16} className="text-emerald-800"/>}</button>)}<p className="border-t border-stone-100 px-3 pb-1 pt-3 text-xs leading-4 text-stone-500">More Nigerian languages coming soon.</p></div>}</div>;
}
