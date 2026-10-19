import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, localizedHref, locales } from "@/lib/i18n";
import { getVisibleProduct, listVisibleProducts } from "@/lib/catalog";
import { productName, products as fallbackProducts } from "@/lib/products";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    fallbackProducts.map((product) => ({ lang, slug: product.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getVisibleProduct(slug);
  if (!product || !isLocale(lang)) return { title: "MIRKA" };
  const dict = getDictionary(lang);
  return {
    title: productName(product, lang),
    description: product.fullName || dict.product.metaFallback,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [product, products] = await Promise.all([
    getVisibleProduct(slug),
    listVisibleProducts(),
  ]);
  if (!product) notFound();

  const dict = getDictionary(lang);
  const name = productName(product, lang);
  const related = products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 4);

  return (
    <section className="px-5 py-12 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-paper lg:col-span-7">
          <Image
            src={product.image}
            alt={name}
            fill
            priority
            className="object-contain p-8 md:p-12"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </div>
        <div className="lg:col-span-5 lg:pt-8">
          <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
            {dict.filters.categories[product.category]}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            {name}
          </h1>
          <p className="mt-5 text-xl tabular-nums">{product.priceLabel}</p>
          <p className="mt-6 leading-relaxed text-ink/65">
            {lang === "en" ? name : product.fullName}. {dict.product.handmade}
          </p>
          <div className="mt-10">
            <ProductActions slug={product.slug} name={name} />
          </div>
          <Link href={localizedHref(lang, "/kolekcija")} className="btn-ghost mt-10">
            {dict.product.back}
          </Link>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mx-auto mt-24 max-w-[1400px]">
          <h2 className="font-serif text-4xl md:text-5xl">{dict.product.more}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={localizedHref(lang, `/proizvod/${item.slug}`)}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                  <Image
                    src={item.image}
                    alt={productName(item, lang)}
                    fill
                    className="object-contain p-5 transition duration-700 group-hover:scale-105"
                    sizes="25vw"
                  />
                </div>
                <p className="mt-3 font-serif text-xl">{productName(item, lang)}</p>
                <p className="text-sm text-muted">{item.priceLabel}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
