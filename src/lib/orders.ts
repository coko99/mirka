import { listVisibleProducts } from "@/lib/catalog";
import { readJsonFile, mutateJsonFile } from "@/lib/json-store";
import { formatRsd, priceValue } from "@/lib/products";
import {
  deliveryLabel,
  isCheckoutMethod,
  isDeliveryMethod,
  type DeliveryMethod,
} from "@/lib/shipping";
import {
  getSupabase,
  isMissingRelation,
  isSupabaseConfigured,
  throwIfError,
} from "@/lib/supabase";

export const ORDER_STATUSES = [
  "nova",
  "u_pripremi",
  "poslato",
  "zavrseno",
  "otkazano",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  price: string;
  priceLabel: string;
};

export type OrderBuyer = {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  postal: string;
  note: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  buyer: OrderBuyer;
  delivery: DeliveryMethod;
  shippingFee: number;
  shippingLabel: string;
  subtotal: number;
  subtotalLabel: string;
  items: OrderItem[];
  total: number;
  totalLabel: string;
  emailedAt?: string;
  emailError?: string;
};

type CheckoutPayload = {
  email?: string;
  city?: string;
  address?: string;
  postal?: string;
  delivery?: string;
  shippingFee?: number;
  shippingLabel?: string;
  subtotal?: number;
};

const FILE = "orders.json";

type OrderRow = {
  id: string;
  created_at: string;
  status: OrderStatus;
  buyer_name: string;
  buyer_phone: string;
  buyer_note: string;
  items: OrderItem[];
  total: number;
  total_label: string;
  checkout?: CheckoutPayload | null;
  emailed_at: string | null;
  email_error: string | null;
};

const CHECKOUT_PREFIX = "__CHECKOUT__:";

function encodeNote(order: Order) {
  return `${CHECKOUT_PREFIX}${JSON.stringify(checkoutPayload(order))}\n${order.buyer.note}`;
}

function decodeNote(note: string) {
  if (!note.startsWith(CHECKOUT_PREFIX)) {
    return { note, checkout: {} as CheckoutPayload };
  }
  const breakAt = note.indexOf("\n");
  const raw =
    breakAt === -1
      ? note.slice(CHECKOUT_PREFIX.length)
      : note.slice(CHECKOUT_PREFIX.length, breakAt);
  const rest = breakAt === -1 ? "" : note.slice(breakAt + 1);
  try {
    return { note: rest, checkout: JSON.parse(raw) as CheckoutPayload };
  } catch {
    return { note, checkout: {} as CheckoutPayload };
  }
}

function emptyBuyer(): OrderBuyer {
  return {
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    postal: "",
    note: "",
  };
}

function parseCheckout(raw: CheckoutPayload | null | undefined, fallbackTotal: number) {
  const candidate = raw?.delivery || "";
  const delivery: DeliveryMethod = isDeliveryMethod(candidate)
    ? candidate
    : "courier";
  const subtotal = Number(raw?.subtotal);
  return {
    email: raw?.email || "",
    city: raw?.city || "",
    address: raw?.address || "",
    postal: raw?.postal || "",
    delivery,
    shippingFee: Number(raw?.shippingFee) || 0,
    shippingLabel: raw?.shippingLabel || deliveryLabel(delivery),
    subtotal: Number.isFinite(subtotal) && subtotal > 0 ? subtotal : fallbackTotal,
  };
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  nova: "Nova",
  u_pripremi: "U pripremi",
  poslato: "Poslato",
  zavrseno: "Završeno",
  otkazano: "Otkazano",
};

function fromRow(row: OrderRow): Order {
  const decoded = decodeNote(row.buyer_note || "");
  const stored = row.checkout && Object.keys(row.checkout).length > 0
    ? row.checkout
    : decoded.checkout;
  const checkout = parseCheckout(stored, row.total);
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    buyer: {
      ...emptyBuyer(),
      name: row.buyer_name,
      phone: row.buyer_phone,
      note: decoded.note,
      email: checkout.email,
      city: checkout.city,
      address: checkout.address,
      postal: checkout.postal,
    },
    delivery: checkout.delivery,
    shippingFee: checkout.shippingFee,
    shippingLabel: checkout.shippingLabel,
    subtotal: checkout.subtotal,
    subtotalLabel: formatRsd(checkout.subtotal),
    items: row.items,
    total: row.total,
    totalLabel: row.total_label,
    emailedAt: row.emailed_at ?? undefined,
    emailError: row.email_error ?? undefined,
  };
}

function checkoutPayload(order: Order): CheckoutPayload {
  return {
    email: order.buyer.email,
    city: order.buyer.city,
    address: order.buyer.address,
    postal: order.buyer.postal,
    delivery: order.delivery,
    shippingFee: order.shippingFee,
    shippingLabel: order.shippingLabel,
    subtotal: order.subtotal,
  };
}

function toRow(order: Order) {
  return {
    id: order.id,
    created_at: order.createdAt,
    status: order.status,
    buyer_name: order.buyer.name,
    buyer_phone: order.buyer.phone,
    buyer_note: order.buyer.note,
    items: order.items,
    total: order.total,
    total_label: order.totalLabel,
    checkout: checkoutPayload(order),
    emailed_at: order.emailedAt ?? null,
    email_error: order.emailError ?? null,
  };
}

function hydrateStoredOrder(order: Order): Order {
  const checkout = parseCheckout(checkoutPayload(order), order.total);
  return {
    ...order,
    buyer: {
      ...emptyBuyer(),
      ...order.buyer,
      email: order.buyer.email || checkout.email,
      city: order.buyer.city || checkout.city,
      address: order.buyer.address || checkout.address,
      postal: order.buyer.postal || checkout.postal,
    },
    delivery: order.delivery || checkout.delivery,
    shippingFee: order.shippingFee ?? checkout.shippingFee,
    shippingLabel: order.shippingLabel || checkout.shippingLabel,
    subtotal: order.subtotal ?? checkout.subtotal,
    subtotalLabel: order.subtotalLabel || formatRsd(order.subtotal ?? checkout.subtotal),
  };
}

export async function readOrders() {
  if (!isSupabaseConfigured()) {
    const orders = await readJsonFile<Order[]>(FILE, []);
    return [...orders]
      .map(hydrateStoredOrder)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (isMissingRelation(error)) {
    const orders = await readJsonFile<Order[]>(FILE, []);
    return [...orders]
      .map(hydrateStoredOrder)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  throwIfError(error, "Narudžbine nisu učitane.");
  return ((data ?? []) as OrderRow[]).map(fromRow);
}

export async function getOrder(id: string) {
  if (!isSupabaseConfigured()) {
    const orders = await readOrders();
    return orders.find((order) => order.id === id) ?? null;
  }
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error, "Narudžbina nije učitana.");
  return data ? fromRow(data as OrderRow) : null;
}

function nextOrderId(existingIds: string[]) {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const count = existingIds.filter((id) => id.includes(day)).length + 1;
  return `MWL-${day}-${String(count).padStart(3, "0")}`;
}

export type CreateOrderInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postal: string;
  delivery: string;
  note: string;
  items: { slug: string; qty: number }[];
};

async function buildOrder(input: CreateOrderInput & { existingIds: string[] }) {
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const city = input.city.trim();
  const address = input.address.trim();
  const postal = input.postal.trim();
  const note = input.note.trim();
  if (name.length < 2 || phone.length < 6 || !email.includes("@")) {
    throw new Error("Unesite ime, telefon i email.");
  }
  if (!isCheckoutMethod(input.delivery)) {
    throw new Error("Izaberite način dostave.");
  }
  if (input.delivery === "courier" && (city.length < 2 || address.length < 5)) {
    throw new Error("Unesite grad i adresu za kurirsku dostavu.");
  }
  if (!input.items.length) {
    throw new Error("Korpa je prazna.");
  }

  const catalog = await listVisibleProducts();
  const items: OrderItem[] = [];
  for (const line of input.items) {
    const product = catalog.find((item) => item.slug === line.slug);
    if (!product || line.qty < 1) continue;
    items.push({
      slug: product.slug,
      name: product.name,
      qty: line.qty,
      price: product.price,
      priceLabel: product.priceLabel,
    });
  }
  if (!items.length) {
    throw new Error("Nema dostupnih proizvoda u korpi.");
  }
  const subtotal = items.reduce(
    (sum, item) => sum + priceValue(item.price) * item.qty,
    0,
  );
  const shippingLabel = deliveryLabel(input.delivery);
  return {
    id: nextOrderId(input.existingIds),
    createdAt: new Date().toISOString(),
    status: "nova" as const,
    buyer: {
      name,
      phone,
      email,
      city: input.delivery === "courier" ? city : "",
      address: input.delivery === "courier" ? address : "",
      postal: input.delivery === "courier" ? postal : "",
      note,
    },
    delivery: input.delivery,
    shippingFee: 0,
    shippingLabel,
    subtotal,
    subtotalLabel: formatRsd(subtotal),
    items,
    total: subtotal,
    totalLabel: formatRsd(subtotal),
  } satisfies Order;
}

export async function createOrder(input: CreateOrderInput) {
  if (!isSupabaseConfigured()) {
    return mutateJsonFile<Order[]>(FILE, [], async (orders) => {
      const order = await buildOrder({
        ...input,
        existingIds: orders.map((item) => item.id),
      });
      return [order, ...orders];
    }).then((orders) => orders[0]);
  }

  const prefix = `MWL-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`;
  const { data: existing, error: listError } = await getSupabase()
    .from("orders")
    .select("id")
    .like("id", `${prefix}%`);
  throwIfError(listError, "Narudžbina nije kreirana.");
  const order = await buildOrder({
    ...input,
    existingIds: ((existing ?? []) as { id: string }[]).map((row) => row.id),
  });
  const row = toRow(order);
  const { error } = await getSupabase().from("orders").insert(row);
  if (error && /checkout|PGRST204|schema cache/i.test(error.message)) {
    const legacy = { ...row, buyer_note: encodeNote(order) };
    delete (legacy as { checkout?: CheckoutPayload }).checkout;
    const retry = await getSupabase().from("orders").insert(legacy);
    throwIfError(retry.error, "Narudžbina nije sačuvana.");
    return order;
  }
  throwIfError(error, "Narudžbina nije sačuvana.");
  return order;
}

export async function markOrderEmailResult(
  id: string,
  result: { ok: true } | { ok: false; error: string },
) {
  const emailedAt = result.ok ? new Date().toISOString() : undefined;
  const emailError = result.ok ? undefined : result.error;

  if (!isSupabaseConfigured()) {
    return mutateJsonFile<Order[]>(FILE, [], (orders) =>
      orders.map((order) =>
        order.id === id
          ? {
              ...order,
              emailedAt: result.ok ? new Date().toISOString() : order.emailedAt,
              emailError: result.ok ? undefined : result.error,
            }
          : order,
      ),
    );
  }

  const patch = result.ok
    ? { emailed_at: emailedAt, email_error: null }
    : { email_error: emailError };
  const { error } = await getSupabase().from("orders").update(patch).eq("id", id);
  throwIfError(error, "Status emaila nije sačuvan.");
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("Nepoznat status.");
  }
  if (!isSupabaseConfigured()) {
    return mutateJsonFile<Order[]>(FILE, [], (orders) =>
      orders.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  }
  const { error } = await getSupabase()
    .from("orders")
    .update({ status })
    .eq("id", id);
  throwIfError(error, "Status nije izmenjen.");
}
