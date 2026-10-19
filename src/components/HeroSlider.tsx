"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { useCatalog } from "@/components/CatalogProvider";
import { featuredFrom, productName } from "@/lib/products";

export function HeroSlider() {
  const { locale, dict, href } = useI18n();
  const featuredProducts = featuredFrom(useCatalog());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = [
    {
      image: "/brand/cover.png",
      kicker: dict.hero.kicker,
      title: dict.hero.title,
      text: dict.hero.text,
      href: href("/kolekcija"),
      cta: dict.hero.openCollection,
      name: "MIRKA",
    },
    ...featuredProducts.slice(0, 5).map((product, slideIndex) => ({
      image: product.image,
      kicker: `0${slideIndex + 2} — ${productName(product, locale)}`,
      title: productName(product, locale),
      text: `${product.priceLabel} · ${dict.hero.handmadePrice}`,
      href: href(`/proizvod/${product.slug}`),
      cta: dict.hero.viewPiece,
      name: productName(product, locale),
    })),
  ];

  const slide = slides[index];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, index, slides.length]);

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((item, slideIndex) => (
        <div
          key={item.image + slideIndex}
          className={`absolute inset-0 transition-opacity duration-700 ${
            slideIndex === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={item.image}
            alt=""
            fill
            priority={slideIndex === 0}
            className="scale-150 object-cover blur-3xl brightness-110 saturate-200"
            sizes="100vw"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-ink/25" />
      <div className="absolute inset-0 bg-linear-to-r from-ink/85 via-ink/45 to-ink/20" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1400px] items-end gap-8 px-5 pt-28 pb-28 md:grid-cols-12 md:items-center md:px-10">
        <div className={index === 0 ? "md:col-span-10 lg:col-span-8" : "md:col-span-6 lg:col-span-5"}>
          <p className="text-[11px] tracking-[0.32em] text-blush/80 uppercase">
            {slide.kicker}
          </p>
          <h1 className="mt-5 whitespace-pre-line font-serif text-[3.4rem] leading-[0.88] md:text-[5.6rem]">
            {index === 0 ? slide.title : dict.hero.wearColor}
          </h1>
          {index !== 0 ? (
            <p className="mt-5 max-w-sm text-lg text-cream/80">{slide.name}</p>
          ) : null}
          <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/65 md:text-base">
            {slide.text}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href={slide.href} className="btn-invert">
              {slide.cta}
            </Link>
            <Link href={href("/o-nama")} className="btn-ghost text-cream/80 hover:text-cream">
              {dict.hero.brandStory}
            </Link>
          </div>
        </div>

        {index !== 0 ? (
          <div className="relative md:col-span-6 lg:col-span-7">
            <div className="relative ml-auto aspect-[4/5] w-full max-w-xl overflow-hidden md:aspect-[5/6] md:max-w-none">
              {slides.map((item, slideIndex) =>
                slideIndex === 0 ? null : (
                  <Image
                    key={`fg-${item.image}-${slideIndex}`}
                    src={item.image}
                    alt={item.name}
                    fill
                    className={`object-contain object-center p-6 transition-opacity duration-700 md:p-10 ${
                      slideIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                    sizes="(max-width: 768px) 90vw, 50vw"
                  />
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="hidden md:col-span-6 md:block lg:col-span-7" />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-6 px-5 py-6 md:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="shrink-0 text-[11px] tracking-[0.22em] tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <div className="flex min-w-0 flex-1 gap-1.5">
            {slides.map((item, slideIndex) => (
              <button
                key={item.image + slideIndex}
                type="button"
                aria-label={`${dict.hero.slide} ${slideIndex + 1}`}
                onClick={() => setIndex(slideIndex)}
                className="h-px flex-1 bg-cream/25"
              >
                {slideIndex === index ? (
                  <span className="animate-grow-x block h-px bg-cream" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={dict.hero.prev}
            onClick={() =>
              setIndex((current) => (current - 1 + slides.length) % slides.length)
            }
            className="grid size-10 place-items-center border border-cream/25 text-lg leading-none"
          >
            ←
          </button>
          <button
            type="button"
            aria-label={dict.hero.next}
            onClick={() => setIndex((current) => (current + 1) % slides.length)}
            className="grid size-10 place-items-center border border-cream/25 text-lg leading-none"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
