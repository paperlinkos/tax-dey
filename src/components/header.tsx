"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { languageOptions } from "@/lib/i18n";
import { useLanguage } from "./language-provider";
import { LogoMark } from "./logo-mark";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const links = [["/vault", t.navVault], ["/calculate", t.calculate], ["/trust", t.navTrust], ["/filing", t.navFiling], ["/learn", t.learn]] as const;
  const signedIn = useSignedIn();
  return <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
    <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-forest"><LogoMark size={32}/>Tax Dey</Link>
    <nav aria-label="Main navigation" className="hidden gap-6 text-sm font-medium text-muted md:flex">{links.map(([href, label]) => <Link key={href} href={href} className="hover:text-ink">{label}</Link>)}</nav>
    {/* Quiet → loud: language and account are text controls so the vault button is the only solid one. */}
    <div className="flex items-center gap-1 sm:gap-2"><LanguageSwitcher language={language} setLanguage={setLanguage} label={t.language}/><span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block"/><Link href={signedIn ? "/dashboard" : "/login"} className="rounded-lg px-2.5 py-2 text-sm font-semibold text-ink hover:bg-ink/5">{signedIn ? t.myAccount : t.logIn}</Link><Link href="/vault" className="ml-1 hidden rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-leaf sm:inline-block">{t.openVault}</Link></div>
  </div><nav aria-label="Main navigation (mobile)" className="flex gap-5 overflow-x-auto px-5 pb-3 text-sm font-medium text-muted md:hidden">{links.map(([href, label]) => <Link key={href} href={href} className="shrink-0">{label}</Link>)}</nav></header>;
}

function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { fetch("/api/auth/get-session").then((response) => (response.ok ? response.json() : null)).then((session) => setSignedIn(Boolean(session))).catch(() => setSignedIn(false)); }, []);
  return signedIn;
}

function LanguageSwitcher({ language, setLanguage, label }: { language: "en" | "pcm"; setLanguage: (language: "en" | "pcm") => void; label: string }) {
  const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null); const button = useRef<HTMLButtonElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } }; document.addEventListener("mousedown", close); document.addEventListener("keydown", escape); return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); }; }, []);
  const choose = (value: "en" | "pcm") => { setLanguage(value); setOpen(false); button.current?.focus(); };
  return <div ref={root} className="relative"><button ref={button} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }} className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-muted transition hover:bg-ink/5 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf ${open ? "bg-ink/5 text-ink" : ""}`}><Globe2 size={16}/><span>{language === "en" ? "EN" : "PG"}</span><ChevronDown size={14} aria-hidden="true" className={`transition ${open ? "rotate-180" : ""}`}/></button>{open && <div role="menu" aria-label={label} className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-lg"><div className="px-3 py-2 text-xs text-muted">Choose language</div>{languageOptions.map((option) => <button role="menuitemradio" aria-checked={option.value === language} key={option.value} onClick={() => choose(option.value)} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const next = option.value === "en" ? "pcm" : "en"; choose(next); setOpen(true); } }} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-mint focus:bg-mint focus:outline-none">{option.label}{option.value === language && <Check size={16} className="text-leaf"/>}</button>)}<p className="border-t border-line px-3 pb-1 pt-3 text-xs leading-4 text-muted">More Nigerian languages coming soon.</p></div>}</div>;
}
