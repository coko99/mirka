"use client";

import { useI18n } from "@/components/LocaleProvider";

export function Marquee() {
  const { dict } = useI18n();
  const row = [...dict.marquee, ...dict.marquee];

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-ink text-cream">
      <div className="animate-marquee flex w-max gap-10 py-3 pr-10 text-[11px] tracking-[0.28em] uppercase">
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            {item}
            <span className="size-1 rounded-full bg-rose" />
          </span>
        ))}
      </div>
    </div>
  );
}
