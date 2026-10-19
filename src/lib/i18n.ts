export const locales = ["sr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sr";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizedHref(locale: Locale, path: string) {
  const [pathname, search] = path.split("?");
  const suffix = search ? `?${search}` : "";
  const clean = pathname || "/";

  if (locale === defaultLocale) {
    return `${clean}${suffix}`;
  }

  if (clean === "/") {
    return `/en${suffix}`;
  }

  return `/en${clean}${suffix}`;
}

export function stripLocale(pathname: string) {
  if (pathname === "/en" || pathname === "/sr") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  if (pathname.startsWith("/sr/")) return pathname.slice(3);
  return pathname;
}

export function localeFromPathname(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return "sr";
}

export function switchLocaleHref(
  pathname: string,
  search: string,
  next: Locale,
) {
  const path = stripLocale(pathname);
  return `${localizedHref(next, path)}${search}`;
}
