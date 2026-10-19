"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { useCart } from "@/lib/cart";
import { colorFilters, productName, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { locale, dict, href } = useI18n();
  const [added, setAdded] = useState(false);
  const name = productName(product, locale);

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper">
        <Link href={href(`/proizvod/${product.slug}`)} className="absolute inset-0">
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-contain p-5 transition duration-700 group-hover:scale-[1.06]"
          />
        </Link>
        <button
          type="button"
          onClick={() => {
            add(product.slug);
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1600);
          }}
          className="absolute inset-x-3 bottom-3 z-10 bg-ink/90 py-3 text-[10px] tracking-[0.2em] text-cream uppercase opacity-100 transition md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          {added ? dict.product.added : dict.product.add}
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <Link
            href={href(`/proizvod/${product.slug}`)}
            className="font-serif text-xl leading-snug md:text-[1.35rem]"
          >
            {name}
          </Link>
          <p className="mt-1 text-[11px] tracking-[0.16em] text-muted uppercase">
            {dict.filters.categories[product.category]}
          </p>
          <div className="mt-2 flex gap-1.5">
            {product.colors.map((color) => {
              const swatch = colorFilters.find((item) => item.id === color);
              return (
                <span
                  key={color}
                  title={dict.filters.colors[color]}
                  className="size-2.5 ring-1 ring-ink/15"
                  style={{ background: swatch?.hex }}
                />
              );
            })}
          </div>
        </div>
        <p className="shrink-0 text-sm tabular-nums">{product.priceLabel}</p>
      </div>
    </article>
  );
}
