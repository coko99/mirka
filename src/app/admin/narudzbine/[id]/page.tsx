import Link from "next/link";
import { notFound } from "next/navigation";
import { resendOrderEmail, setOrderStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getOrder,
  ORDER_STATUSES,
  orderStatusLabel,
} from "@/lib/orders";
import { site, whatsappHref } from "@/lib/site";

function formatWhen(value: string) {
  return new Date(value).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const waText = [
    `Narudžbina ${order.id}`,
    order.buyer.name,
    order.buyer.phone,
    ...order.items.map((item) => `${item.qty}× ${item.name}`),
    order.totalLabel,
  ].join("\n");

  return (
    <div>
      <Link href="/admin/narudzbine" className="text-xs underline">
        ← Sve narudžbine
      </Link>
      <h1 className="mt-4 font-serif text-5xl">{order.id}</h1>
      <p className="mt-2 text-sm text-muted">{formatWhen(order.createdAt)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-2xl">Kupac</h2>
          <p className="mt-3">{order.buyer.name}</p>
          <p className="text-sm">{order.buyer.phone}</p>
          {order.buyer.note ? (
            <p className="mt-3 text-sm text-ink/70">{order.buyer.note}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={whatsappHref(waText)}
              target="_blank"
              rel="noreferrer"
              className="btn-line"
            >
              WhatsApp
            </a>
            <a href={`tel:${order.buyer.phone}`} className="btn-line">
              Pozovi
            </a>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(order.id)}`}
              className="btn-line"
            >
              Email ateljeu
            </a>
          </div>
        </section>

        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-2xl">Status</h2>
          <form action={setOrderStatus} className="mt-4 flex flex-wrap gap-3">
            <input type="hidden" name="id" value={order.id} />
            <select
              name="status"
              defaultValue={order.status}
              className="border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-ink"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabel[status]}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-solid">
              Sačuvaj
            </button>
          </form>
          <form action={resendOrderEmail} className="mt-6">
            <input type="hidden" name="id" value={order.id} />
            <p className="text-sm text-ink/70">
              {order.emailedAt
                ? `Email poslat ${formatWhen(order.emailedAt)}`
                : order.emailError
                  ? `Email nije otišao: ${order.emailError}`
                  : "Email još nije poslat."}
            </p>
            <button type="submit" className="btn-line mt-3">
              Pošalji na email
            </button>
          </form>
        </section>
      </div>

      <section className="mt-8 border border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-6 py-4">
          <h2 className="font-serif text-2xl">Stavke</h2>
        </div>
        <ul>
          {order.items.map((item) => (
            <li
              key={item.slug}
              className="flex items-center justify-between gap-4 border-b border-ink/6 px-6 py-4 last:border-0"
            >
              <div>
                <Link href={`/proizvod/${item.slug}`} className="hover:underline">
                  {item.name}
                </Link>
                <p className="text-xs text-muted">{item.qty} × {item.priceLabel}</p>
              </div>
              <p className="tabular-nums">{item.priceLabel}</p>
            </li>
          ))}
        </ul>
        <p className="px-6 py-4 text-right font-serif text-2xl">{order.totalLabel}</p>
      </section>
    </div>
  );
}
