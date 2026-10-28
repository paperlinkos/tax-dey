"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTranslation, type Language } from "@/lib/i18n";

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: ReturnType<typeof getTranslation> };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  useEffect(() => { const saved = window.localStorage.getItem("tax-de-language"); const timer = window.setTimeout(() => { if (saved === "en" || saved === "pcm") setLanguageState(saved); }); return () => window.clearTimeout(timer); }, []);
  const setLanguage = (next: Language) => { setLanguageState(next); window.localStorage.setItem("tax-de-language", next); };
  return <LanguageContext.Provider value={{ language, setLanguage, t: getTranslation(language) }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { const context = useContext(LanguageContext); if (!context) throw new Error("useLanguage must be used inside LanguageProvider"); return context; }
