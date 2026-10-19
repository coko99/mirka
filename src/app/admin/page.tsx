import { DashboardView } from "@/app/admin/DashboardView";
import { requireAdmin } from "@/lib/admin-auth";
import { calendarDay, resolveDateRange } from "@/lib/calendar";
import { readAdminCatalog } from "@/lib/catalog";
import { buildInsights } from "@/lib/insights";
import { readMessages } from "@/lib/messages";
import { readOrders } from "@/lib/orders";
import { readSiteViews } from "@/lib/site-views";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const range = resolveDateRange(query.from, query.to);
  const [products, orders, messages, views] = await Promise.all([
    readAdminCatalog(),
    readOrders(),
    readMessages(),
    readSiteViews(range.from),
  ]);
  const insights = buildInsights(products, orders, messages, views, range);
  const inRange = (iso: string) => {
    const day = calendarDay(iso);
    return day >= range.from && day <= range.to;
  };

  return (
    <DashboardView
      insights={insights}
      orders={orders.filter((order) => inRange(order.createdAt))}
      messages={messages.filter((message) => inRange(message.createdAt))}
    />
  );
}
