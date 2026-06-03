"use client";

// Lightweight language context — available on every page, including the public
// landing and login (which have no data store). The data store re-exposes these
// same values so authenticated pages can keep reading `t` from useStore().

import { createContext, useContext, useState } from "react";
import en from "@/messages/en";
import es from "@/messages/es";

export type Lang = "en" | "es";

interface LangValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const dict = lang === "en" ? en : es;
  const t = (key: string) => dict[key] ?? key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
