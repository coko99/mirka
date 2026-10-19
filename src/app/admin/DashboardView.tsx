import Link from "next/link";
import type { ReactNode } from "react";
import { PeriodPicker } from "@/app/admin/PeriodPicker";
import type { ShopInsights } from "@/lib/insights";
import type { SiteMessage } from "@/lib/messages";
import { orderStatusLabel, type Order } from "@/lib/orders";
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

function Trend({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value > 0;
  const down = value < 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] tracking-wide ${
        down
          ? "bg-rose/15 text-rose"
          : up
            ? "bg-ink text-cream"
            : "bg-ink/5 text-muted"
      }`}
    >
      {up ? "↑" : down ? "↓" : "→"} {Math.abs(value)}%
    </span>
  );
}

function Bars({
  items,
  valueKey,
  fill = "bg-ink",
}: {
  items: { label: string; orders: number; views: number; revenue: number }[];
  valueKey: "orders" | "views" | "revenue";
  fill?: string;
}) {
  const max = Math.max(...items.map((item) => item[valueKey]), 1);
  return (
    <div className="flex h-40 items-end gap-1">
      {items.map((item) => {
        const value = item[valueKey];
        const height = Math.max(6, Math.round((value / max) * 100));
        return (
          <div
            key={`${valueKey}-${item.label}-${item.orders}-${item.views}`}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div
              className={`w-full rounded-t-md ${fill}`}
              style={{ height: `${height}%` }}
              title={`${item.label}: ${valueKey === "revenue" ? formatRsd(value) : value}`}
            />
            <span className="max-w-full truncate text-[9px] tracking-wide text-muted">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-ink/8 bg-white/90 p-5 shadow-[0_18px_50px_-32px_rgba(20,17,16,0.45)] ${className}`}
    >
      {children}
    </section>
  );
}

export function DashboardView({
  insights,
  orders,
  messages,
}: {
  insights: ShopInsights;
  orders: Order[];
  messages: SiteMessage[];
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
            Pregled
          </p>
          <h1 className="mt-2 font-serif text-5xl md:text-6xl">Atelje</h1>
          <p className="mt-3 max-w-xl text-sm text-ink/60">
            {insights.rangeLabel} · Promet ne računa otkazane porudžbine.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/narudzbine?status=nova"
            className="rounded-full bg-ink px-3 py-1.5 text-xs text-cream"
          >
            {insights.now.newOrders} nove
          </Link>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs text-ink/70">
            U radu {insights.now.pipelineLabel}
          </span>
          <Link
            href="/admin/poruke"
            className="rounded-full bg-white px-3 py-1.5 text-xs text-ink/70"
          >
            {insights.now.unread} poruke
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <PeriodPicker range={insights.range} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.kpis.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-3xl border border-ink/8 bg-white/90 p-5 shadow-[0_18px_50px_-32px_rgba(20,17,16,0.45)] transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
                {stat.label}
              </p>
              <Trend value={stat.trend} />
            </div>
            <p className="mt-4 font-serif text-3xl tabular-nums">{stat.value}</p>
            <p className="mt-2 text-xs text-ink/50">{stat.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.secondary.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-ink/8 bg-cream/70 p-5"
          >
            <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
              {stat.label}
            </p>
            <p className="mt-3 font-serif text-2xl tabular-nums">{stat.value}</p>
            <p className="mt-2 text-xs text-ink/50">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-2xl">Porudžbine</h2>
          <p className="mt-1 text-xs text-muted">Tok kroz izabrani period</p>
          <div className="mt-6">
            <Bars items={insights.series} valueKey="orders" />
          </div>
        </Card>
        <Card>
          <h2 className="font-serif text-2xl">Pregledi sajta</h2>
          <p className="mt-1 text-xs text-muted">
            {insights.hasViews
              ? `${insights.totals.views} pregleda · ${insights.totals.visitors} posetilaca`
              : "Brojanje kreće čim neko otvori sajt."}
          </p>
          <div className="mt-6">
            <Bars items={insights.series} valueKey="views" fill="bg-burgundy" />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-serif text-2xl">Status</h2>
          <ul className="mt-5 space-y-3">
            {insights.byStatus.map((row) => (
              <li key={row.status}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <Link
                    href={`/admin/narudzbine?status=${row.status}`}
                    className="hover:underline"
                  >
                    {row.label}
                  </Link>
                  <span className="tabular-nums text-muted">
                    {row.count} · {row.totalLabel}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/8">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${Math.round((row.count / insights.statusMax) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-serif text-2xl">Dostava</h2>
          {insights.delivery.length ? (
            <ul className="mt-5 space-y-3">
              {insights.delivery.map((row) => (
                <li key={row.method}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>{row.label}</span>
                    <span className="tabular-nums text-muted">
                      {row.count} · {row.totalLabel}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full bg-burgundy"
                      style={{
                        width: `${Math.round((row.count / insights.deliveryMax) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-muted">Još nema porudžbina u ovom periodu.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-serif text-2xl">Sajt i kupci</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li className="flex justify-between gap-3">
              <span>Kupci</span>
              <span className="tabular-nums">{insights.totals.uniqueBuyers}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Vraćaju se</span>
              <span className="tabular-nums">{insights.totals.repeatBuyers}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Na sajtu</span>
              <span className="tabular-nums">{insights.totals.catalogVisible}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Skriveno</span>
              <span className="tabular-nums">{insights.totals.catalogHidden}</span>
            </li>
            {insights.totals.conversion !== null ? (
              <li className="flex justify-between gap-3">
                <span>Korpa / posetilac</span>
                <span className="tabular-nums">{insights.totals.conversion}%</span>
              </li>
            ) : null}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-2xl">Najprodavanije</h2>
          {insights.topProducts.length ? (
            <ul className="mt-4 divide-y divide-ink/6">
              {insights.topProducts.map((item) => (
                <li key={item.slug} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/proizvodi/${item.slug}`} className="hover:underline">
                    {item.name}
                  </Link>
                  <span className="shrink-0 tabular-nums text-muted">
                    {item.qty} kom · {item.revenueLabel}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Nema prodaje u ovom periodu.</p>
          )}
          {insights.byCategory.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {insights.byCategory.map((item) => (
                <li
                  key={item.id}
                  className="rounded-full bg-cream px-3 py-1 text-xs"
                >
                  {item.label}: {item.qty}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card>
          <h2 className="font-serif text-2xl">Šta se gleda</h2>
          {insights.pages.length ? (
            <ul className="mt-4 space-y-3">
              {insights.pages.map((item) => (
                <li key={item.page}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{item.label}</span>
                    <span className="tabular-nums text-muted">{item.views}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full bg-ink/70"
                      style={{ width: `${Math.round((item.views / insights.pageMax) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Pregledi stranica pojavljuju se posle prvih poseta.
            </p>
          )}
          {insights.topViewed.length ? (
            <div className="mt-6">
              <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
                Proizvodi
              </p>
              <ul className="mt-3 divide-y divide-ink/6">
                {insights.topViewed.map((item) => (
                  <li key={item.slug} className="flex justify-between gap-3 py-2.5 text-sm">
                    <Link href={`/admin/proizvodi/${item.slug}`} className="hover:underline">
                      {item.name}
                    </Link>
                    <span className="tabular-nums text-muted">{item.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {insights.topCities.length ? (
            <div className="mt-6">
              <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
                Gradovi, kurir
              </p>
              <ul className="mt-3 divide-y divide-ink/6">
                {insights.topCities.map((item) => (
                  <li key={item.city} className="flex justify-between gap-3 py-2.5 text-sm">
                    <span>{item.city}</span>
                    <span className="tabular-nums text-muted">
                      {item.count} · {item.totalLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl">Narudžbine u periodu</h2>
            <Link href="/admin/narudzbine" className="text-xs text-muted hover:text-ink">
              Sve
            </Link>
          </div>
          <div className="mt-4 divide-y divide-ink/6">
            {orders.slice(0, 6).map((order) => (
              <Link
                key={order.id}
                href={`/admin/narudzbine/${order.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:opacity-70"
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
              <p className="py-6 text-sm text-muted">Nema narudžbina u ovom periodu.</p>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl">Poruke u periodu</h2>
            <Link href="/admin/poruke" className="text-xs text-muted hover:text-ink">
              Sve
            </Link>
          </div>
          <div className="mt-4 divide-y divide-ink/6">
            {messages.slice(0, 6).map((message) => (
              <div key={message.id} className="py-3">
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
              <p className="py-6 text-sm text-muted">Nema poruka u ovom periodu.</p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
