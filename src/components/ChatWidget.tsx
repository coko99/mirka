"use client";

import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { site } from "@/lib/site";

export function ChatWidget() {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2 md:right-6 md:bottom-24">
      {open ? (
        <div className="w-64 overflow-hidden border border-ink/10 bg-cream shadow-2xl">
          <div className="bg-ink px-4 py-3 text-cream">
            <p className="font-serif text-xl">{dict.chat.title}</p>
            <p className="text-[11px] text-cream/50">{dict.chat.subtitle}</p>
          </div>
          <div className="flex flex-col">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="border-b border-ink/8 px-4 py-3 text-sm hover:bg-paper"
            >
              WhatsApp
              <span className="mt-0.5 block text-xs text-muted">
                {site.phoneDisplay}
              </span>
            </a>
            <a
              href={site.viber}
              className="border-b border-ink/8 px-4 py-3 text-sm hover:bg-paper"
            >
              Viber
              <span className="mt-0.5 block text-xs text-muted">
                {dict.chat.viberNote}
              </span>
            </a>
            <a href={`tel:${site.phoneTel}`} className="px-4 py-3 text-sm hover:bg-paper">
              {dict.chat.call}
              <span className="mt-0.5 block text-xs text-muted">
                {site.phoneDisplay}
              </span>
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid h-12 min-w-12 place-items-center bg-ink px-4 text-[11px] tracking-[0.18em] text-cream uppercase"
        aria-expanded={open}
        aria-label={open ? dict.chat.close : dict.chat.open}
      >
        {open ? dict.chat.close : "Chat"}
      </button>
    </div>
  );
}
