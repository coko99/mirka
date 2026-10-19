import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartView } from "@/components/CartView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.cart.metaTitle,
    description: dict.cart.metaDescription,
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <section className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
          {dict.cart.kicker}
        </p>
        <h1 className="mt-3 font-serif text-6xl md:text-8xl">{dict.cart.title}</h1>
        <div className="mt-12">
          <CartView />
        </div>
      </div>
    </section>
  );
}
