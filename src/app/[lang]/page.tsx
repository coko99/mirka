import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroSlider } from "@/components/HeroSlider";
import { Marquee } from "@/components/Marquee";
import { ProductCard } from "@/components/ProductCard";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, localizedHref } from "@/lib/i18n";
import { listVisibleProducts } from "@/lib/catalog";
import { colorFilters, featuredFrom } from "@/lib/products";

const lightColors = new Set(["zuta", "bez", "bela"]);

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const products = await listVisibleProducts();
  const featuredProducts = featuredFrom(products);
  const lookbook = featuredProducts.slice(0, 3);
  const [brandLine1, brandLine2] = dict.home.brandTitle.split("\n");

  return (
    <>
      <HeroSlider />
      <Marquee />

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1400px] items-end gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
              {dict.home.brandKicker}
            </p>
            <h2 className="mt-5 font-serif text-5xl leading-[0.92] md:text-7xl">
              {brandLine1}
              <br />
              {brandLine2}
            </h2>
            <div className="mt-8 max-w-xl space-y-4 text-base leading-relaxed text-ink/70">
              <p>{dict.home.brandP1}</p>
              <p>{dict.home.brandP2}</p>
            </div>
            <Link href={localizedHref(lang, "/o-nama")} className="btn-ghost mt-8 text-ink">
              {dict.home.wholeStory}
            </Link>
          </div>

          <div className="relative lg:col-span-6">
            <p className="absolute -top-8 right-0 font-serif text-[7rem] leading-none text-ink/6 md:text-[10rem]">
              17
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
              {lookbook.map((product, index) => (
                <Link
                  key={product.id}
                  href={localizedHref(lang, `/proizvod/${product.slug}`)}
                  className={`relative overflow-hidden bg-paper ${
                    index === 0
                      ? "col-span-2 aspect-[4/5] md:col-span-7"
                      : index === 1
                        ? "aspect-square md:col-span-5 md:self-end"
                        : "aspect-[4/5] md:col-span-5 md:col-start-8 md:-mt-16"
                  }`}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    sizes="40vw"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-[1400px] grid-cols-3 border-y border-ink/10">
          {[
            ["2017", dict.home.statYear],
            ["2", dict.home.statCities],
            [`${products.length}+`, dict.home.statPieces],
          ].map(([value, label]) => (
            <div key={label} className="px-3 py-8 md:px-8">
              <p className="font-serif text-4xl md:text-6xl">{value}</p>
              <p className="mt-2 text-[11px] tracking-[0.18em] text-muted uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between px-5 pb-8 md:px-10">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
              {dict.home.colorKicker}
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-6xl">
              {dict.home.colorTitle}
            </h2>
          </div>
          <Link
            href={localizedHref(lang, "/kolekcija")}
            className="hidden text-sm md:inline"
          >
            {dict.home.allColors}
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12">
          {colorFilters.map((color) => (
            <Link
              key={color.id}
              href={localizedHref(lang, `/kolekcija?boja=${color.id}`)}
              className="group relative flex min-h-36 flex-col justify-end p-4 md:min-h-52"
              style={{ background: color.hex }}
            >
              <span
                className={`text-[11px] tracking-[0.16em] uppercase transition group-hover:-translate-y-1 ${
                  lightColors.has(color.id) ? "text-ink" : "text-cream"
                }`}
              >
                {dict.filters.colors[color.id]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
                {dict.home.atelierKicker}
              </p>
              <h2 className="mt-3 font-serif text-4xl md:text-6xl">
                {dict.home.featuredTitle}
              </h2>
            </div>
            <Link
              href={localizedHref(lang, "/kolekcija")}
              className="btn-ghost shrink-0"
            >
              {dict.home.wholeCollection} ({products.length}) →
            </Link>
          </div>
          <div className="mt-12 grid gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-5">
            <p className="text-[11px] tracking-[0.32em] text-blush/70 uppercase">
              {dict.home.placesKicker}
            </p>
            <h2 className="mt-4 font-serif text-5xl md:text-6xl">
              {dict.home.placesTitle}
            </h2>
            <p className="mt-5 max-w-sm text-cream/60">{dict.home.placesText}</p>
          </div>
          <div className="grid gap-px bg-white/10 md:col-span-7 md:grid-cols-2">
            {[
              ["MIRKA atelje", "Balkanska 26, Kruševac"],
              ["Just Machine", "Kneginje Zorke 81, Beograd"],
            ].map(([name, address]) => (
              <div key={name} className="bg-ink p-8">
                <p className="font-serif text-3xl">{name}</p>
                <p className="mt-3 text-sm text-cream/55">{address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
