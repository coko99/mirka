"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { placeShopOrder } from "@/app/admin/actions";
import { useI18n } from "@/components/LocaleProvider";
import { useCart } from "@/lib/cart";
import { formatRsd, productName } from "@/lib/products";
import { CHECKOUT_METHODS, type CheckoutMethod } from "@/lib/shipping";
import { site, whatsappHref } from "@/lib/site";

const emptyBuyer = {
  name: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  postal: "",
  note: "",
};

export function CartView() {
  const router = useRouter();
  const { items, total, setQty, remove, clear } = useCart();
  const { locale, dict, href } = useI18n();
  const [buyer, setBuyer] = useState(emptyBuyer);
  const [delivery, setDelivery] = useState<CheckoutMethod>("courier");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const courier = delivery === "courier";

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
    `${dict.cart.email}: ${buyer.email || "-"}`,
    `${dict.cart.orderPhone}: ${buyer.phone || "-"}`,
    courier
      ? `${dict.cart.address}: ${buyer.address}, ${buyer.postal} ${buyer.city}`
      : dict.cart.pickupKrusevac,
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

  function field<K extends keyof typeof emptyBuyer>(key: K, placeholder: string) {
    return (
      <input
        required={
          key === "name" ||
          key === "email" ||
          key === "phone" ||
          (courier && (key === "city" || key === "address"))
        }
        type={key === "email" ? "email" : "text"}
        placeholder={placeholder}
        value={buyer[key]}
        onChange={(event) =>
          setBuyer((current) => ({ ...current, [key]: event.target.value }))
        }
        className="w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
      />
    );
  }

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
        <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
          {dict.cart.subtotal}
        </p>
        <p className="font-serif text-3xl">{formatRsd(total)}</p>
        <p className="mt-1 text-sm text-ink/55">{dict.cart.payNote}</p>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setSaving(true);
            try {
              const order = await placeShopOrder({
                ...buyer,
                delivery,
                items: items.map((item) => ({
                  slug: item.product.slug,
                  qty: item.qty,
                })),
              });
              clear();
              router.push(href(`/porudzbina/${order.id}`));
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
          {field("name", dict.cart.name)}
          {field("email", dict.cart.email)}
          {field("phone", dict.cart.phone)}

          <p className="pt-2 text-[11px] tracking-[0.16em] text-muted uppercase">
            {dict.cart.deliveryTitle}
          </p>
          <div className="space-y-2">
            {CHECKOUT_METHODS.map((method) => (
              <label
                key={method}
                className={`flex cursor-pointer gap-3 border px-3 py-3 text-sm ${
                  delivery === method
                    ? "border-ink bg-white"
                    : "border-ink/10 bg-white/60"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === method}
                  onChange={() => setDelivery(method)}
                  className="mt-1"
                />
                <span>
                  {method === "pickup_krusevac"
                    ? dict.cart.pickupKrusevac
                    : dict.cart.courier}
                  {method === "courier" ? (
                    <span className="mt-1 block text-xs text-ink/55">
                      {dict.cart.courierHint}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
          {courier ? (
            <>
              {field("city", dict.cart.city)}
              {field("address", dict.cart.address)}
              {field("postal", dict.cart.postal)}
            </>
          ) : null}

          <textarea
            placeholder={dict.cart.note}
            value={buyer.note}
            onChange={(event) =>
              setBuyer((current) => ({ ...current, note: event.target.value }))
            }
            className="w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
            rows={3}
          />

          <div className="border-t border-ink/10 pt-4 text-sm">
            <p className="flex justify-between font-medium">
              <span>{dict.cart.orderTotal}</span>
              <span className="tabular-nums">{formatRsd(total)}</span>
            </p>
          </div>

          {error ? (
            <p className="border border-rose/30 bg-blush/40 px-3 py-2 text-sm">
              {error}
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
