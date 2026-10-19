import { mutateJsonFile, readJsonFile } from "@/lib/json-store";
import { formatRsd, getProduct, priceValue } from "@/lib/products";

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

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  buyer: {
    name: string;
    phone: string;
    note: string;
  };
  items: OrderItem[];
  total: number;
  totalLabel: string;
  emailedAt?: string;
  emailError?: string;
};

const FILE = "orders.json";

export const orderStatusLabel: Record<OrderStatus, string> = {
  nova: "Nova",
  u_pripremi: "U pripremi",
  poslato: "Poslato",
  zavrseno: "Završeno",
  otkazano: "Otkazano",
};

export async function readOrders() {
  const orders = await readJsonFile<Order[]>(FILE, []);
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getOrder(id: string) {
  const orders = await readOrders();
  return orders.find((order) => order.id === id) ?? null;
}

function nextOrderId(orders: Order[]) {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const count = orders.filter((order) => order.id.includes(day)).length + 1;
  return `MWL-${day}-${String(count).padStart(3, "0")}`;
}

export async function createOrder(input: {
  name: string;
  phone: string;
  note: string;
  items: { slug: string; qty: number }[];
}) {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (name.length < 2 || phone.length < 6) {
    throw new Error("Unesite ime i telefon.");
  }
  if (!input.items.length) {
    throw new Error("Korpa je prazna.");
  }

  return mutateJsonFile<Order[]>(FILE, [], (orders) => {
    const items: OrderItem[] = [];
    for (const line of input.items) {
      const product = getProduct(line.slug);
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
    const total = items.reduce(
      (sum, item) => sum + priceValue(item.price) * item.qty,
      0,
    );
    const order: Order = {
      id: nextOrderId(orders),
      createdAt: new Date().toISOString(),
      status: "nova",
      buyer: {
        name,
        phone,
        note: input.note.trim(),
      },
      items,
      total,
      totalLabel: formatRsd(total),
    };
    return [order, ...orders];
  }).then((orders) => orders[0]);
}

export async function markOrderEmailResult(
  id: string,
  result: { ok: true } | { ok: false; error: string },
) {
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

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("Nepoznat status.");
  }
  return mutateJsonFile<Order[]>(FILE, [], (orders) =>
    orders.map((order) => (order.id === id ? { ...order, status } : order)),
  );
}
