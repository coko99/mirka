import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { readAdminCatalog } from "@/lib/catalog";
import { readMessages } from "@/lib/messages";
import { orderStatusLabel, readOrders } from "@/lib/orders";
import { formatRsd } from "@/lib/products";

function formatWhen(value: string) {
  return new Date(value).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminHomePage() {
  await requireAdmin();
  const [products, orders, messages] = await Promise.all([
    readAdminCatalog(),
    readOrders(),
    readMessages(),
  ]);

  const visible = products.filter((product) => !product.hidden).length;
  const newOrders = orders.filter((order) => order.status === "nova").length;
  const unread = messages.filter((message) => !message.read).length;
  const revenue = orders
    .filter((order) => order.status !== "otkazano")
    .reduce((sum, order) => sum + order.total, 0);

  const stats = [
    { label: "Proizvodi", value: String(visible), href: "/admin/proizvodi" },
    { label: "Nove narudžbine", value: String(newOrders), href: "/admin/narudzbine" },
    { label: "Nove poruke", value: String(unread), href: "/admin/poruke" },
    { label: "Promet", value: formatRsd(revenue), href: "/admin/narudzbine" },
  ];

  return (
    <div>
      <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Pregled</p>
      <h1 className="mt-2 font-serif text-5xl md:text-6xl">Atelje</h1>
      <p className="mt-3 max-w-xl text-sm text-ink/65">
        Ovde menjate proizvode, pratite narudžbine sa sajta i poruke sa kontakta.
        Izmene se čuvaju u fajlove sajta.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-ink/10 bg-paper p-5 hover:border-ink/25"
          >
            <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
              {stat.label}
            </p>
            <p className="mt-3 font-sans text-3xl tabular-nums">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl">Poslednje narudžbine</h2>
            <Link href="/admin/narudzbine" className="text-xs underline">
              Sve
            </Link>
          </div>
          <div className="mt-5 divide-y divide-ink/8 border border-ink/10 bg-white">
            {orders.slice(0, 6).map((order) => (
              <Link
                key={order.id}
                href={`/admin/narudzbine/${order.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-paper"
              >
                <div>
                  <p className="text-sm">{order.buyer.name}</p>
                  <p className="text-xs text-muted">
                    {order.id} · {formatWhen(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums">{order.totalLabel}</p>
                  <p className="text-[11px] text-muted">
                    {orderStatusLabel[order.status]}
                  </p>
                </div>
              </Link>
            ))}
            {orders.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">
                Još nema narudžbina sa sajta.
              </p>
            ) : null}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl">Poruke</h2>
            <Link href="/admin/poruke" className="text-xs underline">
              Sve
            </Link>
          </div>
          <div className="mt-5 divide-y divide-ink/8 border border-ink/10 bg-white">
            {messages.slice(0, 6).map((message) => (
              <div key={message.id} className="px-4 py-3">
                <p className="text-sm">
                  {message.name}
                  {!message.read ? (
                    <span className="ml-2 text-[11px] text-rose uppercase">novo</span>
                  ) : null}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{message.message}</p>
              </div>
            ))}
            {messages.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Nema poruka.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
