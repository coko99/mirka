"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/components/LocaleProvider";
import {
  categories,
  colorFilters,
  featuredProducts,
  filterProducts,
  priceFilters,
  type Category,
  type ColorId,
  type PriceId,
} from "@/lib/products";

export function ProductGrid({
  mode = "all",
  initialCategory = "sve",
  initialColor = "sve",
  initialPrice = "sve",
}: {
  mode?: "featured" | "all";
  initialCategory?: Category | "sve";
  initialColor?: ColorId | "sve";
  initialPrice?: PriceId | "sve";
}) {
  const { dict } = useI18n();
  const [active, setActive] = useState<Category | "sve">(initialCategory);
  const [color, setColor] = useState<ColorId | "sve">(initialColor);
  const [price, setPrice] = useState<PriceId | "sve">(initialPrice);

  const list = useMemo(() => {
    if (
      mode === "featured" &&
      active === "sve" &&
      color === "sve" &&
      price === "sve"
    ) {
      return featuredProducts;
    }
    return filterProducts(active, color, price);
  }, [active, color, mode, price]);

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-ink/10">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActive(category.id)}
            className={`-mb-px border-b pb-3 text-sm transition ${
              active === category.id
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {dict.filters.categories[category.id]}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-4">
        <button
          type="button"
          onClick={() => setColor("sve")}
          className={`pb-1 text-[11px] tracking-[0.16em] uppercase ${
            color === "sve" ? "text-ink" : "text-muted"
          }`}
        >
          {dict.collection.allColors}
        </button>
        {colorFilters.map((swatch) => (
          <button
            key={swatch.id}
            type="button"
            title={dict.filters.colors[swatch.id]}
            onClick={() => setColor(swatch.id)}
            className="group flex flex-col items-center gap-2"
          >
            <span
              className={`size-8 ring-1 transition ${
                color === swatch.id
                  ? "ring-ink ring-offset-2 ring-offset-cream"
                  : "ring-ink/15 group-hover:ring-ink/40"
              }`}
              style={{ background: swatch.hex }}
            />
            <span
              className={`text-[10px] tracking-[0.12em] uppercase ${
                color === swatch.id ? "text-ink" : "text-muted"
              }`}
            >
              {dict.filters.colors[swatch.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-ink/10">
        <button
          type="button"
          onClick={() => setPrice("sve")}
          className={`-mb-px border-b pb-3 text-sm transition ${
            price === "sve"
              ? "border-ink text-ink"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {dict.collection.allPrices}
        </button>
        {priceFilters.map((range) => (
          <button
            key={range.id}
            type="button"
            onClick={() => setPrice(range.id)}
            className={`-mb-px border-b pb-3 text-sm transition ${
              price === range.id
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {dict.filters.prices[range.id]}
          </button>
        ))}
      </div>

      <p className="mt-8 text-[11px] tracking-[0.18em] text-muted uppercase">
        {list.length} {dict.collection.pieces}
      </p>

      <div className="mt-8 grid gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-muted">{dict.collection.empty}</p>
      ) : null}
    </div>
  );
}
