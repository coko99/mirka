"use client";

import Link from "next/link";
import { useI18n } from "@/components/LocaleProvider";
import { site } from "@/lib/site";

export function Footer() {
  const { dict, href } = useI18n();

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
        <p className="font-serif text-[18vw] leading-none tracking-tight md:text-[9rem]">
          MIRKA
        </p>
        <div className="mt-10 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-blush/70 uppercase">
              {site.tagline}
            </p>
            <p className="mt-3 max-w-xs text-sm text-cream/55">{dict.footer.blurb}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href={href("/")} className="hover:text-blush">
              {dict.nav.home}
            </Link>
            <Link href={href("/kolekcija")} className="hover:text-blush">
              {dict.nav.collection}
            </Link>
            <Link href={href("/o-nama")} className="hover:text-blush">
              {dict.nav.about}
            </Link>
            <Link href={href("/kontakt")} className="hover:text-blush">
              {dict.nav.contact}
            </Link>
            <Link href={href("/korpa")} className="hover:text-blush">
              {dict.nav.cart}
            </Link>
          </div>
          <div className="space-y-3 text-sm text-cream/60">
            {site.shops.map((shop) => (
              <p key={shop.name}>
                <span className="block text-cream">{shop.name}</span>
                {shop.address}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href={site.instagram} target="_blank" rel="noreferrer" className="hover:text-blush">
              Instagram
            </a>
            <a href={site.facebook} target="_blank" rel="noreferrer" className="hover:text-blush">
              Facebook
            </a>
            <a href={`mailto:${site.email}`} className="hover:text-blush">
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
