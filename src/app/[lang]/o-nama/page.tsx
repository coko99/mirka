import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, localizedHref } from "@/lib/i18n";
import { featuredProducts } from "@/lib/products";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [title1, title2] = dict.about.title.split("\n");

  return (
    <section className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
          {dict.about.kicker}
        </p>
        <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] md:text-8xl">
          {title1}
          <br />
          {title2}
        </h1>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="relative min-h-96 overflow-hidden bg-ink lg:col-span-7">
            <Image
              src="/brand/cover.png"
              alt={dict.about.coverAlt}
              fill
              className="object-cover opacity-90"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-ink/70 lg:col-span-5 lg:pt-6">
            <p>{dict.about.p1}</p>
            <p>{dict.about.p2}</p>
            <p>{dict.about.p3}</p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-4 inline-flex"
            >
              @mirka_withlove →
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-px bg-ink/10 md:grid-cols-3">
          {[
            [dict.about.unique, dict.about.uniqueText],
            [dict.about.sustainable, dict.about.sustainableText],
            [dict.about.heritage, dict.about.heritageText],
          ].map(([title, text]) => (
            <article key={title} className="bg-cream p-8 md:p-10">
              <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4">
          {featuredProducts.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={localizedHref(lang, `/proizvod/${product.slug}`)}
              className="relative aspect-[4/5] overflow-hidden bg-paper"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="25vw"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
