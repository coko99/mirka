"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { useCart } from "@/lib/cart";
import { stripLocale } from "@/lib/i18n";

export function Header() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname() ?? "/";
  const path = stripLocale(pathname);
  const { count } = useCart();
  const { locale, dict, href, switchHref } = useI18n();

  useEffect(() => {
    setReady(true);
  }, []);

  const cartCount = ready ? count : 0;
  const isHome = path === "/";
  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/kolekcija", label: dict.nav.collection },
    { href: "/o-nama", label: dict.nav.about },
    { href: "/kontakt", label: dict.nav.contact },
  ];

  return (
    <header
      className={`top-0 z-40 ${
        isHome
          ? "absolute inset-x-0 text-cream"
          : "sticky border-b border-ink/8 bg-cream/80 text-ink backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
        <Link href={href("/")} className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/brand/logo.png"
            alt="MIRKA with love"
            width={44}
            height={44}
            className="size-10 object-cover md:size-11"
            priority
          />
          <span className="leading-none">
            <span className="block font-serif text-[1.35rem] tracking-[0.08em]">
              MIRKA
            </span>
            <span className="block text-[10px] tracking-[0.28em] uppercase opacity-60">
              with love
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] md:flex">
          {links.map((link) => {
            const active =
              link.href === "/" ? path === "/" : path.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={href(link.href)}
                className={
                  active
                    ? isHome
                      ? "text-blush"
                      : "text-rose"
                    : isHome
                      ? "text-cream/75 hover:text-cream"
                      : "text-ink/70 hover:text-ink"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={switchHref(locale === "sr" ? "en" : "sr")}
            className={isHome ? "text-cream/75 hover:text-cream" : "text-ink/70 hover:text-ink"}
            hrefLang={locale === "sr" ? "en" : "sr"}
          >
            {locale === "sr" ? "EN" : "SR"}
          </Link>
          <Link
            href={href("/korpa")}
            className="relative grid size-10 place-items-center"
            aria-label={dict.nav.cart}
          >
            <BagIcon />
            {cartCount > 0 ? (
              <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-rose text-[9px] text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href={switchHref(locale === "sr" ? "en" : "sr")}
            className="text-[12px]"
          >
            {locale === "sr" ? "EN" : "SR"}
          </Link>
          <Link
            href={href("/korpa")}
            className="relative grid size-10 place-items-center"
            aria-label={dict.nav.cart}
          >
            <BagIcon />
            {cartCount > 0 ? (
              <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-rose text-[9px] text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={dict.nav.menu}
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 place-items-center"
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className={`block h-px w-full ${isHome ? "bg-cream" : "bg-ink"}`} />
              <span className={`block h-px w-full ${isHome ? "bg-cream" : "bg-ink"}`} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className={`flex flex-col gap-4 border-t px-5 py-6 md:hidden ${
            isHome ? "border-white/10 bg-ink/90" : "border-ink/8 bg-cream"
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={href(link.href)}
              onClick={() => setOpen(false)}
              className="font-serif text-3xl"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 8.5h11l-.7 11.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8L6.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
