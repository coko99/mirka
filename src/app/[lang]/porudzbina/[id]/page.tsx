import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, localizedHref } from "@/lib/i18n";
import { getOrder } from "@/lib/orders";
import { site } from "@/lib/site";

function formatWhen(value: string, locale: string) {
  return new Date(value).toLocaleString(locale === "en" ? "en-GB" : "sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: `${dict.confirm.metaTitle} ${id}`,
    description: dict.confirm.metaDescription,
  };
}

export default async function OrderConfirmPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const order = await getOrder(id);
  if (!order) notFound();
  const dict = getDictionary(lang);

  return (
    <section className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
          {dict.confirm.kicker}
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-none md:text-7xl">
          {dict.confirm.title}
        </h1>
        <p className="mt-5 max-w-lg text-ink/65">{dict.confirm.intro}</p>

        <div className="mt-10 border border-ink/10 bg-paper p-6 md:p-8">
          <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
            {dict.confirm.number}
          </p>
          <p className="mt-2 font-serif text-4xl">{order.id}</p>
          <p className="mt-2 text-sm text-muted">
            {formatWhen(order.createdAt, lang)}
          </p>
        </div>

        <section className="mt-8 border border-ink/10 bg-white">
          <div className="border-b border-ink/10 px-6 py-4">
            <h2 className="font-serif text-2xl">{dict.confirm.items}</h2>
          </div>
          <ul>
            {order.items.map((item) => (
              <li
                key={item.slug}
                className="flex items-center justify-between gap-4 border-b border-ink/6 px-6 py-4"
              >
                <div>
                  <Link
                    href={localizedHref(lang, `/proizvod/${item.slug}`)}
                    className="hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {item.qty} × {item.priceLabel}
                  </p>
                </div>
                <p className="tabular-nums">{item.priceLabel}</p>
              </li>
            ))}
          </ul>
          <p className="px-6 py-4 text-right font-serif text-2xl">
            {order.totalLabel}
          </p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="border border-ink/10 bg-white p-6">
            <h2 className="font-serif text-2xl">{dict.confirm.delivery}</h2>
            <p className="mt-3 text-sm leading-relaxed">{order.shippingLabel}</p>
            {order.buyer.address ? (
              <p className="mt-3 text-sm text-ink/70">
                {order.buyer.address}
                <br />
                {order.buyer.postal} {order.buyer.city}
              </p>
            ) : null}
            {order.buyer.note ? (
              <p className="mt-3 text-sm text-ink/70">{order.buyer.note}</p>
            ) : null}
          </section>
          <section className="border border-ink/10 bg-white p-6">
            <h2 className="font-serif text-2xl">{dict.confirm.contact}</h2>
            <p className="mt-3">{order.buyer.name}</p>
            <p className="text-sm">{order.buyer.phone}</p>
            {order.buyer.email ? (
              <p className="text-sm">{order.buyer.email}</p>
            ) : null}
            <p className="mt-6 text-[11px] tracking-[0.16em] text-muted uppercase">
              {dict.confirm.atelier}
            </p>
            <p className="mt-2 text-sm">
              {site.phoneDisplay}
              <br />
              {site.email}
            </p>
          </section>
        </div>

        <Link href={localizedHref(lang, "/kolekcija")} className="btn-solid mt-10">
          {dict.confirm.back}
        </Link>
      </div>
    </section>
  );
}
