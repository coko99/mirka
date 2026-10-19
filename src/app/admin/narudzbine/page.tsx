import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { orderStatusLabel, readOrders, type OrderStatus } from "@/lib/orders";

function formatWhen(value: string) {
  return new Date(value).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const orders = await readOrders();
  const list = status
    ? orders.filter((order) => order.status === status)
    : orders;

  const filters: { id: OrderStatus | "sve"; label: string }[] = [
    { id: "sve", label: "Sve" },
    { id: "nova", label: "Nove" },
    { id: "u_pripremi", label: "U pripremi" },
    { id: "poslato", label: "Poslato" },
    { id: "zavrseno", label: "Završeno" },
    { id: "otkazano", label: "Otkazano" },
  ];

  return (
    <div>
      <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Prodaja</p>
      <h1 className="mt-2 font-serif text-5xl">Narudžbine</h1>
      <p className="mt-3 text-sm text-ink/65">
        Stižu kad kupac potvrdi korpu na sajtu.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        {filters.map((filter) => {
          const href =
            filter.id === "sve"
              ? "/admin/narudzbine"
              : `/admin/narudzbine?status=${filter.id}`;
          const active = (status || "sve") === filter.id;
          return (
            <Link
              key={filter.id}
              href={href}
              className={`text-sm ${active ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-paper text-[11px] tracking-[0.16em] text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Broj</th>
              <th className="px-4 py-3 font-normal">Kupac</th>
              <th className="px-4 py-3 font-normal">Datum</th>
              <th className="px-4 py-3 font-normal">Iznos</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((order) => (
              <tr key={order.id} className="border-b border-ink/6 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/narudzbine/${order.id}`} className="underline">
                    {order.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p>{order.buyer.name}</p>
                  <p className="text-xs text-muted">{order.buyer.phone}</p>
                </td>
                <td className="px-4 py-3 text-muted">{formatWhen(order.createdAt)}</td>
                <td className="px-4 py-3 tabular-nums">{order.totalLabel}</td>
                <td className="px-4 py-3">{orderStatusLabel[order.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">Nema narudžbina.</p>
        ) : null}
      </div>
    </div>
  );
}
