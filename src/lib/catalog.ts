import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";
import { hydrateProduct, type Product, type RawProduct } from "@/lib/products";
import {
  getSupabase,
  isMissingRelation,
  isSupabaseConfigured,
  throwIfError,
} from "@/lib/supabase";

const FILE = "products.json";
const BUCKET = "product-images";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  full_name: string;
  price: string;
  price_label: string;
  category: RawProduct["category"];
  image_file: string;
  source_image: string | null;
  source_url: string | null;
  image: string;
  hidden: boolean;
  featured: boolean;
};

function fromRow(row: ProductRow): RawProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    fullName: row.full_name,
    price: row.price,
    priceLabel: row.price_label,
    category: row.category,
    imageFile: row.image_file,
    sourceImage: row.source_image || "",
    sourceUrl: row.source_url || "",
    image: row.image,
    hidden: row.hidden,
    featured: row.featured,
  };
}

function toRow(product: RawProduct) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    full_name: product.fullName,
    price: product.price,
    price_label: product.priceLabel,
    category: product.category,
    image_file: product.imageFile,
    source_image: product.sourceImage || "",
    source_url: product.sourceUrl || "",
    image: product.image,
    hidden: Boolean(product.hidden),
    featured: Boolean(product.featured),
    updated_at: new Date().toISOString(),
  };
}

async function readJsonCatalog() {
  return readJsonFile<RawProduct[]>(FILE, []);
}

export const readRawCatalog = cache(async () => {
  if (!isSupabaseConfigured()) {
    return readJsonCatalog();
  }
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (isMissingRelation(error)) return readJsonCatalog();
  throwIfError(error, "Katalog nije učitan.");
  return ((data ?? []) as ProductRow[]).map(fromRow);
});

export async function readAdminCatalog(): Promise<Product[]> {
  const raw = await readRawCatalog();
  return raw.map(hydrateProduct);
}

export const listVisibleProducts = cache(async () => {
  return (await readAdminCatalog()).filter((product) => !product.hidden);
});

export async function getVisibleProduct(slug: string) {
  const products = await listVisibleProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function insertProduct(product: RawProduct) {
  if (!isSupabaseConfigured()) {
    const catalog = await readJsonCatalog();
    await writeJsonFile(FILE, [product, ...catalog]);
    return;
  }
  const { error } = await getSupabase().from("products").insert(toRow(product));
  throwIfError(error, "Proizvod nije sačuvan.");
}

export async function updateProduct(previousSlug: string, product: RawProduct) {
  if (!isSupabaseConfigured()) {
    const catalog = await readJsonCatalog();
    await writeJsonFile(
      FILE,
      catalog.map((item) => (item.slug === previousSlug ? product : item)),
    );
    return;
  }
  const { error } = await getSupabase()
    .from("products")
    .update(toRow(product))
    .eq("slug", previousSlug);
  throwIfError(error, "Proizvod nije izmenjen.");
}

export async function deleteProduct(slug: string) {
  if (!isSupabaseConfigured()) {
    const catalog = await readJsonCatalog();
    await writeJsonFile(
      FILE,
      catalog.filter((item) => item.slug !== slug),
    );
    return;
  }
  const { error } = await getSupabase().from("products").delete().eq("slug", slug);
  throwIfError(error, "Proizvod nije obrisan.");
}

export function slugify(value: string) {
  return value
    .replace(/[šŠ]/g, "s")
    .replace(/[đĐ]/g, "dj")
    .replace(/[čČćĆ]/g, "c")
    .replace(/[žŽ]/g, "z")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function uniqueSlug(base: string, existing: string[], current?: string) {
  const root = slugify(base) || "proizvod";
  if (root === current) return root;
  if (!existing.includes(root)) return root;
  let i = 2;
  while (existing.includes(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
}

export function formatPriceInput(input: string) {
  const n = Number(String(input).replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString("de-DE");
}

function imageExt(file: File) {
  const ext = path.extname(file.name || "").toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  if (!allowed.includes(ext)) {
    throw new Error("Slika mora biti JPG, PNG ili WebP.");
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("Slika je veća od 6 MB.");
  }
  return ext === ".jpeg" ? ".jpg" : ext;
}

function contentType(ext: string) {
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

export async function saveUploadedImage(file: File) {
  const ext = imageExt(file);
  const filename = `admin-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured()) {
    const { error } = await getSupabase()
      .storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: contentType(ext),
        upsert: false,
      });
    throwIfError(error, "Slika nije otpremljena.");
    const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(filename);
    return { imageFile: filename, image: data.publicUrl };
  }

  const dir = path.join(process.cwd(), "public", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return { imageFile: filename, image: `/products/${filename}` };
}
