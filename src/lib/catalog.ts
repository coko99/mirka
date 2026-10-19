import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { mutateJsonFile, readJsonFile } from "@/lib/json-store";
import { hydrateProduct, type Product, type RawProduct } from "@/lib/products";

const FILE = "products.json";

export async function readRawCatalog() {
  return readJsonFile<RawProduct[]>(FILE, []);
}

export async function readAdminCatalog(): Promise<Product[]> {
  const raw = await readRawCatalog();
  return raw.map(hydrateProduct);
}

export async function writeRawCatalog(products: RawProduct[]) {
  await mutateJsonFile<RawProduct[]>(FILE, [], () => products);
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

export async function saveUploadedImage(file: File) {
  const ext = path.extname(file.name || "").toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  if (!allowed.includes(ext)) {
    throw new Error("Slika mora biti JPG, PNG ili WebP.");
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("Slika je veća od 6 MB.");
  }
  const dir = path.join(process.cwd(), "public", "products");
  await mkdir(dir, { recursive: true });
  const filename = `admin-${Date.now()}${ext === ".jpeg" ? ".jpg" : ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return filename;
}
