"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionary";
import {
  localizedHref,
  switchLocaleHref,
  type Locale,
} from "@/lib/i18n";
import { usePathname } from "next/navigation";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  href: (path: string) => string;
  switchHref: (next: Locale) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";

  const value: I18nContextValue = {
    locale,
    dict,
    href: (path) => localizedHref(locale, path),
    switchHref: (next) => switchLocaleHref(pathname, "", next),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return context;
}
