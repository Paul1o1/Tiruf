'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import en from '@/locales/en.json';
import am from '@/locales/am.json';

type Lang = 'en' | 'am';

const dicts = { en, am };

interface I18nCtx {
  lang: Lang;
  t: (k: string) => string;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18nCtx>({ lang: 'en', t: (k) => k, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = (k: string) => (dicts[lang] as any)[k] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
