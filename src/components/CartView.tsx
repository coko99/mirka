"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { placeShopOrder } from "@/app/admin/actions";
import { useCart } from "@/lib/cart";
import { formatRsd, productName } from "@/lib/products";
import { site, whatsappHref } from "@/lib/site";

export function CartView() {
  const { items, total, setQty, remove, clear } = useCart();
  const { locale, dict, href } = useI18n();
  const [buyer, setBuyer] = useState({ name: "", phone: "", note: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (items.length === 0) {
    return (
      <div className="border border-ink/10 bg-paper p-10 text-center">
        <p className="font-serif text-4xl">{dict.cart.empty}</p>
        <Link href={href("/kolekcija")} className="btn-solid mt-8">
          {dict.cart.goShop}
        </Link>
      </div>
    );
  }

  const orderText = [
    dict.cart.orderTitle,
    `${dict.cart.orderName}: ${buyer.name || "-"}`,
    `${dict.cart.orderPhone}: ${buyer.phone || "-"}`,
    "",
    ...items.map(
      (item) =>
        `${item.qty}× ${productName(item.product, locale)} — ${item.product.priceLabel}`,
    ),
    "",
    `${dict.cart.orderTotal}: ${formatRsd(total)}`,
    buyer.note ? `${dict.cart.orderNote}: ${buyer.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid gap-10 md:grid-cols-5">
      <div className="space-y-5 md:col-span-3">
        {items.map((item) => (
          <article
            key={item.product.slug}
            className="flex gap-4 border border-ink/8 bg-white p-4"
          >
            <div className="relative size-24 shrink-0 overflow-hidden bg-paper">
              <Image
                src={item.product.image}
                alt={productName(item.product, locale)}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
            <div className="flex-1">
              <Link
                href={href(`/proizvod/${item.product.slug}`)}
                className="font-serif text-xl"
              >
                {productName(item.product, locale)}
              </Link>
              <p className="text-sm text-ink/55">{item.product.priceLabel}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty(item.product.slug, item.qty - 1)}
                  className="grid size-8 place-items-center border border-ink/10 bg-paper"
                >
                  −
                </button>
                <span>{item.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(item.product.slug, item.qty + 1)}
                  className="grid size-8 place-items-center border border-ink/10 bg-paper"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.product.slug)}
                  className="ml-auto text-xs underline"
                >
                  {dict.cart.remove}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="border border-ink/10 bg-paper p-6 md:col-span-2">
        <p className="font-serif text-3xl">{formatRsd(total)}</p>
        <p className="mt-1 text-sm text-ink/55">{dict.cart.payNote}</p>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setSaving(true);
            try {
              await placeShopOrder({
                name: buyer.name,
                phone: buyer.phone,
                note: buyer.note,
                items: items.map((item) => ({
                  slug: item.product.slug,
                  qty: item.qty,
                })),
              });
              setDone(true);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Narudžbina nije sačuvana. Pokušajte ponovo.",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <input
            required
            placeholder={dict.cart.name}
            value={buyer.name}
            onChange={(event) =>
              setBuyer((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
          />
          <input
            required
            placeholder={dict.cart.phone}
            value={buyer.phone}
            onChange={(event) =>
              setBuyer((current) => ({ ...current, phone: event.target.value }))
            }
            className="w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
          />
          <textarea
            placeholder={dict.cart.note}
            value={buyer.note}
            onChange={(event) =>
              setBuyer((current) => ({ ...current, note: event.target.value }))
            }
            className="w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
            rows={3}
          />

          {error ? (
            <p className="border border-rose/30 bg-blush/40 px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}

          {done ? (
            <p className="border border-ink/10 bg-cream px-3 py-2 text-sm">
              {dict.cart.ready}
            </p>
          ) : null}

          <button type="submit" className="btn-solid w-full" disabled={saving}>
            {saving ? "…" : dict.cart.confirm}
          </button>
          <a
            href={whatsappHref(orderText)}
            target="_blank"
            rel="noreferrer"
            className="btn-line w-full"
          >
            {dict.cart.sendWa}
          </a>
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(dict.cart.mailSubject)}&body=${encodeURIComponent(orderText)}`}
            className="block text-center text-xs underline"
          >
            {dict.cart.orEmail}
          </a>
        </form>

        <button type="button" onClick={clear} className="mt-6 text-xs underline">
          {dict.cart.clear}
        </button>
      </aside>
    </div>
  );
}
