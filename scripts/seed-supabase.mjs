import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

function loadLocalEnv() {
  return readFile(".env.local", "utf8").then((raw) => {
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const key = line.slice(0, i);
      if (process.env[key]) continue;
      process.env[key] = line.slice(i + 1).replace(/^["']|["']$/g, "");
    }
  }).catch(() => undefined);
}

await loadLocalEnv();

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Dodaj SUPABASE_URL i SUPABASE_SECRET_KEY u .env.local");
}

const products = JSON.parse(await readFile("src/data/products.json", "utf8"));
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = products.map((product) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  full_name: product.fullName,
  price: product.price,
  price_label: product.priceLabel,
  category: product.category,
  image_file: product.imageFile || String(product.image || "").replace(/^\/products\//, ""),
  source_image: product.sourceImage || "",
  source_url: product.sourceUrl || "",
  image: product.image,
  hidden: Boolean(product.hidden),
  featured: Boolean(product.featured),
  updated_at: new Date().toISOString(),
}));

const chunkSize = 50;
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize);
  const { error } = await supabase.from("products").upsert(chunk, { onConflict: "id" });
  if (error) throw new Error(error.message);
  console.log(`upsert ${Math.min(i + chunk.length, rows.length)}/${rows.length}`);
}

console.log("seed done");
