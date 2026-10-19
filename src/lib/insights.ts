import {
  calendarDay,
  dayRangeInclusive,
  daysBetween,
  formatDayLabel,
  formatRangeLabel,
  monthEnd,
  monthStart,
  previousRange,
  shiftDay,
  shiftMonth,
  type DateRange,
} from "@/lib/calendar";
import type { SiteMessage } from "@/lib/messages";
import type { Order, OrderStatus } from "@/lib/orders";
import { orderStatusLabel } from "@/lib/orders";
import type { Product } from "@/lib/products";
import { adminCategories, formatRsd, priceValue } from "@/lib/products";
import { deliveryLabel, type DeliveryMethod } from "@/lib/shipping";
import {
  SITE_PAGES,
  sitePageLabel,
  type SiteView,
} from "@/lib/site-views";

const PIPELINE: OrderStatus[] = ["nova", "u_pripremi"];
const DONE: OrderStatus[] = ["poslato", "zavrseno"];
const STATUSES: OrderStatus[] = [
  "nova",
  "u_pripremi",
  "poslato",
  "zavrseno",
  "otkazano",
];

function isActive(order: Order) {
  return order.status !== "otkazano";
}

function buyerKey(order: Order) {
  const phone = order.buyer.phone.replace(/\D/g, "");
  if (phone.length >= 6) return `p:${phone}`;
  const email = order.buyer.email.trim().toLowerCase();
  if (email.includes("@")) return `e:${email}`;
  return `n:${order.buyer.name.trim().toLowerCase()}`;
}

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function sumOrders(list: Order[]) {
  return list.reduce((sum, order) => sum + order.total, 0);
}

function inRange(iso: string, range: DateRange) {
  const day = calendarDay(iso);
  return day >= range.from && day <= range.to;
}

function countWord(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function trendHint(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "prvi period" : "nema prošlog perioda";
  const pct = pctChange(current, previous);
  return `${pct >= 0 ? "+" : ""}${pct}% vs prethodni period`;
}

function seriesBuckets(range: DateRange) {
  const length = daysBetween(range.from, range.to);
  if (length <= 42) {
    return dayRangeInclusive(range.from, range.to).map((day) => ({
      key: day,
      from: day,
      to: day,
      label: formatDayLabel(day),
    }));
  }
  if (length <= 180) {
    const buckets = [];
    let cursor = range.from;
    while (cursor <= range.to) {
      const weekEnd = shiftDay(cursor, 6);
      const end = weekEnd > range.to ? range.to : weekEnd;
      buckets.push({
        key: cursor,
        from: cursor,
        to: end,
        label: formatDayLabel(cursor),
      });
      cursor = shiftDay(end, 1);
    }
    return buckets;
  }
  const buckets = [];
  let cursor = range.from;
  while (cursor <= range.to) {
    const close = monthEnd(cursor);
    const end = close > range.to ? range.to : close;
    buckets.push({
      key: cursor.slice(0, 7),
      from: cursor,
      to: end,
      label: `${Number(cursor.slice(5, 7))}.`,
    });
    cursor = shiftMonth(monthStart(cursor), 1);
  }
  return buckets;
}

export function buildInsights(
  products: Product[],
  orders: Order[],
  messages: SiteMessage[],
  views: SiteView[],
  range: DateRange,
) {
  const today = calendarDay();
  const previous = previousRange(range);
  const periodOrders = orders.filter((order) => inRange(order.createdAt, range));
  const prevOrders = orders.filter((order) => inRange(order.createdAt, previous));
  const active = periodOrders.filter(isActive);
  const prevActive = prevOrders.filter(isActive);
  const periodViews = views.filter(
    (view) => view.day >= range.from && view.day <= range.to,
  );
  const prevViews = views.filter(
    (view) => view.day >= previous.from && view.day <= previous.to,
  );
  const periodMessages = messages.filter((message) =>
    inRange(message.createdAt, range),
  );
  const prevMessages = messages.filter((message) =>
    inRange(message.createdAt, previous),
  );

  const revenue = sumOrders(active);
  const prevRevenue = sumOrders(prevActive);
  const visitors = periodViews.filter((view) => view.uniqueDay).length;
  const prevVisitors = prevViews.filter((view) => view.uniqueDay).length;
  const conversion =
    visitors > 0 ? Math.round((active.length / visitors) * 1000) / 10 : null;
  const aov = active.length ? Math.round(revenue / active.length) : 0;

  const byStatus = STATUSES.map((status) => {
    const list = periodOrders.filter((order) => order.status === status);
    return {
      status,
      label: orderStatusLabel[status],
      count: list.length,
      total: sumOrders(list),
      totalLabel: formatRsd(sumOrders(list)),
    };
  });
  const statusMax = Math.max(...byStatus.map((row) => row.count), 1);

  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const sold = new Map<
    string,
    { slug: string; name: string; qty: number; revenue: number; category: string }
  >();
  for (const order of active) {
    for (const item of order.items) {
      const product = productBySlug.get(item.slug);
      const current = sold.get(item.slug) || {
        slug: item.slug,
        name: item.name,
        qty: 0,
        revenue: 0,
        category: product?.category || "ostalo",
      };
      current.qty += item.qty;
      current.revenue += priceValue(item.price) * item.qty;
      sold.set(item.slug, current);
    }
  }

  const topProducts = [...sold.values()]
    .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      revenueLabel: formatRsd(item.revenue),
    }));

  const categories = new Map<string, { id: string; qty: number; revenue: number }>();
  for (const item of sold.values()) {
    const current = categories.get(item.category) || {
      id: item.category,
      qty: 0,
      revenue: 0,
    };
    current.qty += item.qty;
    current.revenue += item.revenue;
    categories.set(item.category, current);
  }
  const byCategory = [...categories.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .map((item) => ({
      id: item.id,
      label:
        adminCategories.find((category) => category.id === item.id)?.label ||
        "Ostalo",
      qty: item.qty,
      revenueLabel: formatRsd(item.revenue),
    }));

  const deliveryCounts = new Map<DeliveryMethod, { count: number; total: number }>();
  for (const order of active) {
    const current = deliveryCounts.get(order.delivery) || { count: 0, total: 0 };
    current.count += 1;
    current.total += order.total;
    deliveryCounts.set(order.delivery, current);
  }
  const delivery = [...deliveryCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([method, value]) => ({
      method,
      label:
        method === "pickup_krusevac"
          ? "Preuzimanje, Kruševac"
          : method === "pickup_beograd"
            ? "Preuzimanje, Beograd"
            : "Kurir",
      hint: deliveryLabel(method),
      count: value.count,
      totalLabel: formatRsd(value.total),
    }));
  const deliveryMax = Math.max(...delivery.map((row) => row.count), 1);

  const cities = new Map<string, { count: number; total: number }>();
  for (const order of active) {
    if (order.delivery !== "courier") continue;
    const city = order.buyer.city.trim() || "Nepoznato";
    const current = cities.get(city) || { count: 0, total: 0 };
    current.count += 1;
    current.total += order.total;
    cities.set(city, current);
  }
  const topCities = [...cities.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([city, value]) => ({
      city,
      count: value.count,
      totalLabel: formatRsd(value.total),
    }));

  const buyers = new Map<string, number>();
  for (const order of active) {
    const key = buyerKey(order);
    buyers.set(key, (buyers.get(key) || 0) + 1);
  }

  const pages = SITE_PAGES.map((page) => ({
    page,
    label: sitePageLabel[page],
    views: periodViews.filter((view) => view.page === page).length,
  }))
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views);
  const pageMax = Math.max(...pages.map((item) => item.views), 1);

  const productViews = new Map<string, number>();
  for (const view of periodViews) {
    if (view.page !== "proizvod" || !view.slug) continue;
    productViews.set(view.slug, (productViews.get(view.slug) || 0) + 1);
  }
  const topViewed = [...productViews.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([slug, count]) => ({
      slug,
      name: productBySlug.get(slug)?.name || slug,
      views: count,
    }));

  const series = seriesBuckets(range).map((bucket) => {
    const dayOrders = active.filter((order) => {
      const day = calendarDay(order.createdAt);
      return day >= bucket.from && day <= bucket.to;
    });
    const dayViews = periodViews.filter(
      (view) => view.day >= bucket.from && view.day <= bucket.to,
    );
    return {
      day: bucket.key,
      label: bucket.label,
      orders: dayOrders.length,
      revenue: sumOrders(dayOrders),
      views: dayViews.length,
      visitors: dayViews.filter((view) => view.uniqueDay).length,
    };
  });

  const completed = periodOrders.filter((order) => DONE.includes(order.status));
  const cancelled = periodOrders.filter((order) => order.status === "otkazano");
  const pipeline = orders.filter((order) => PIPELINE.includes(order.status));
  const liveNew = orders.filter((order) => order.status === "nova").length;
  const unread = messages.filter((message) => !message.read).length;

  return {
    range,
    rangeLabel: formatRangeLabel(range.from, range.to),
    days: daysBetween(range.from, range.to),
    generatedOn: today,
    kpis: [
      {
        label: "Promet",
        value: formatRsd(revenue),
        hint: trendHint(revenue, prevRevenue),
        trend: prevRevenue > 0 || revenue > 0 ? pctChange(revenue, prevRevenue) : null,
        href: "/admin/narudzbine",
      },
      {
        label: "Porudžbine",
        value: String(active.length),
        hint: trendHint(active.length, prevActive.length),
        trend:
          prevActive.length > 0 || active.length > 0
            ? pctChange(active.length, prevActive.length)
            : null,
        href: "/admin/narudzbine",
      },
      {
        label: "Pregledi",
        value: String(periodViews.length),
        hint: `${visitors} ${countWord(visitors, "posetilac", "posetioca", "posetilaca")}`,
        trend:
          prevViews.length > 0 || periodViews.length > 0
            ? pctChange(periodViews.length, prevViews.length)
            : null,
        href: "/admin",
      },
      {
        label: "Poruke",
        value: String(periodMessages.length),
        hint: trendHint(periodMessages.length, prevMessages.length),
        trend:
          prevMessages.length > 0 || periodMessages.length > 0
            ? pctChange(periodMessages.length, prevMessages.length)
            : null,
        href: "/admin/poruke",
      },
    ],
    secondary: [
      {
        label: "Prosečna korpa",
        value: formatRsd(aov),
        hint: conversion === null ? "bez otkazanih" : `konverzija ${conversion}%`,
      },
      {
        label: "Posetioci",
        value: String(visitors),
        hint: trendHint(visitors, prevVisitors),
      },
      {
        label: "Poslato / završeno",
        value: formatRsd(sumOrders(completed)),
        hint: `${completed.length} ${countWord(completed.length, "porudžbina", "porudžbine", "porudžbina")}`,
      },
      {
        label: "Otkazano",
        value: String(cancelled.length),
        hint: formatRsd(sumOrders(cancelled)),
      },
    ],
    now: {
      newOrders: liveNew,
      unread,
      pipeline: pipeline.length,
      pipelineLabel: formatRsd(sumOrders(pipeline)),
    },
    totals: {
      orders: periodOrders.length,
      active: active.length,
      cancelled: cancelled.length,
      completed: completed.length,
      revenue: formatRsd(revenue),
      completedRevenue: formatRsd(sumOrders(completed)),
      uniqueBuyers: buyers.size,
      repeatBuyers: [...buyers.values()].filter((count) => count > 1).length,
      catalogVisible: products.filter((product) => !product.hidden).length,
      catalogHidden: products.filter((product) => product.hidden).length,
      featured: products.filter((product) => product.featured).length,
      views: periodViews.length,
      visitors,
      conversion,
    },
    byStatus,
    statusMax,
    delivery,
    deliveryMax,
    byCategory,
    topProducts,
    topCities,
    topViewed,
    pages,
    pageMax,
    series,
    hasViews: periodViews.length > 0,
  };
}

export type ShopInsights = ReturnType<typeof buildInsights>;
