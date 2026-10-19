"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminPasswordConfigured,
  checkAdminPassword,
  clearAdminSession,
  requireAdmin,
  setAdminSession,
} from "@/lib/admin-auth";
import {
  formatPriceInput,
  readRawCatalog,
  saveUploadedImage,
  uniqueSlug,
  writeRawCatalog,
} from "@/lib/catalog";
import { createMessage, deleteMessage, markMessageRead } from "@/lib/messages";
import { sendOrderEmail } from "@/lib/email";
import {
  createOrder,
  getOrder,
  markOrderEmailResult,
  ORDER_STATUSES,
  updateOrderStatus,
  type OrderStatus,
} from "@/lib/orders";
import type { Category, RawProduct } from "@/lib/products";

function revalidateShop() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/proizvodi");
  revalidatePath("/admin/narudzbine");
  revalidatePath("/admin/poruke");
}

export async function loginAdmin(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  if (!adminPasswordConfigured()) {
    return { error: "ADMIN_PASSWORD nije podešen u .env.local." };
  }
  const password = String(formData.get("password") || "");
  if (!checkAdminPassword(password)) {
    return { error: "Pogrešna lozinka." };
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

function parseCategory(value: FormDataEntryValue | null): Category {
  const category = String(value || "");
  const allowed: Category[] = [
    "torbe",
    "odeca",
    "kape",
    "papuce",
    "suknje",
    "ostalo",
  ];
  return allowed.includes(category as Category)
    ? (category as Category)
    : "ostalo";
}

async function productFromForm(formData: FormData, current?: RawProduct) {
  const name = String(formData.get("name") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim() || name;
  const price = formatPriceInput(String(formData.get("price") || ""));
  const category = parseCategory(formData.get("category"));
  const hidden = formData.get("hidden") === "on";
  const featured = formData.get("featured") === "on";
  const catalog = await readRawCatalog();
  const existingSlugs = catalog.map((item) => item.slug);
  const slug = current?.slug ?? uniqueSlug(name, existingSlugs);

  if (!name || !price) {
    throw new Error("Unesite naziv i cenu.");
  }

  const image = formData.get("image");
  let imageFile = current?.imageFile || "";
  if (image instanceof File && image.size > 0) {
    imageFile = await saveUploadedImage(image);
  }
  if (!imageFile) {
    throw new Error("Dodajte fotografiju proizvoda.");
  }

  const next: RawProduct = {
    id: slug,
    slug,
    name,
    fullName,
    price,
    priceLabel: `${price} RSD`,
    category,
    imageFile,
    sourceImage: current?.sourceImage || "",
    sourceUrl: current?.sourceUrl || "",
    image: `/products/${imageFile}`,
    hidden,
    featured,
  };
  return { next, previousSlug: current?.slug };
}

export async function createAdminProduct(formData: FormData) {
  await requireAdmin();
  const { next } = await productFromForm(formData);
  const catalog = await readRawCatalog();
  await writeRawCatalog([next, ...catalog]);
  revalidateShop();
  redirect(`/admin/proizvodi/${next.slug}`);
}

export async function updateAdminProduct(formData: FormData) {
  await requireAdmin();
  const currentSlug = String(formData.get("slug") || "");
  const catalog = await readRawCatalog();
  const current = catalog.find((item) => item.slug === currentSlug);
  if (!current) {
    throw new Error("Proizvod nije pronađen.");
  }
  const { next, previousSlug } = await productFromForm(formData, current);
  await writeRawCatalog(
    catalog.map((item) => (item.slug === previousSlug ? next : item)),
  );
  revalidateShop();
  redirect(`/admin/proizvodi/${next.slug}`);
}

export async function deleteAdminProduct(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "");
  const catalog = await readRawCatalog();
  await writeRawCatalog(catalog.filter((item) => item.slug !== slug));
  revalidateShop();
  redirect("/admin/proizvodi");
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/narudzbine");
  revalidatePath(`/admin/narudzbine/${id}`);
}

export async function markAdminMessageRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await markMessageRead(id);
  revalidatePath("/admin");
  revalidatePath("/admin/poruke");
}

export async function deleteAdminMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await deleteMessage(id);
  revalidatePath("/admin");
  revalidatePath("/admin/poruke");
}

async function deliverOrderEmail(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return;
  try {
    await sendOrderEmail(order);
    await markOrderEmailResult(order.id, { ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Email nije poslat.";
    console.error("order email failed", message);
    await markOrderEmailResult(order.id, { ok: false, error: message });
  }
}

export async function placeShopOrder(input: {
  name: string;
  phone: string;
  note: string;
  items: { slug: string; qty: number }[];
}) {
  const order = await createOrder(input);
  await deliverOrderEmail(order.id);
  revalidatePath("/admin");
  revalidatePath("/admin/narudzbine");
  revalidatePath(`/admin/narudzbine/${order.id}`);
  return { id: order.id };
}

export async function resendOrderEmail(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await deliverOrderEmail(id);
  revalidatePath("/admin");
  revalidatePath("/admin/narudzbine");
  revalidatePath(`/admin/narudzbine/${id}`);
}

export async function sendShopMessage(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  await createMessage(input);
  revalidatePath("/admin");
  revalidatePath("/admin/poruke");
  return { ok: true };
}
