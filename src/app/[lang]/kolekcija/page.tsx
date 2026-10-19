import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { colorFilters, priceFilters, type Category, type ColorId, type PriceId } from "@/lib/products";

const allowed = ["sve", "torbe", "odeca", "kape", "papuce", "suknje"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.collection.metaTitle,
    description: dict.collection.metaDescription,
  };
}

export default async function KolekcijaPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ k?: string; boja?: string; cena?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const query = await searchParams;

  const category = allowed.includes(query.k as (typeof allowed)[number])
    ? (query.k as Category | "sve")
    : "sve";
  const color = colorFilters.some((item) => item.id === query.boja)
    ? (query.boja as ColorId)
    : "sve";
  const price = priceFilters.some((item) => item.id === query.cena)
    ? (query.cena as PriceId)
    : "sve";

  return (
    <section className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
          {dict.collection.kicker}
        </p>
        <h1 className="mt-3 font-serif text-6xl leading-none md:text-8xl">
          {dict.collection.title}
        </h1>
        <p className="mt-5 max-w-lg text-ink/65">{dict.collection.intro}</p>
        <div className="mt-12">
          <ProductGrid
            mode="all"
            initialCategory={category}
            initialColor={color}
            initialPrice={price}
          />
        </div>
      </div>
    </section>
  );
}
