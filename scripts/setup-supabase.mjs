import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

function loadLocalEnv() {
  return readFile(".env.local", "utf8")
    .then((raw) => {
      for (const line of raw.split(/\r?\n/)) {
        if (!line || line.startsWith("#") || !line.includes("=")) continue;
        const i = line.indexOf("=");
        const key = line.slice(0, i);
        if (process.env[key]) continue;
        process.env[key] = line.slice(i + 1).replace(/^["']|["']$/g, "");
      }
    })
    .catch(() => undefined);
}

await loadLocalEnv();

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Dodaj SUPABASE_URL i SUPABASE_SECRET_KEY u .env.local");
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function runSql(sql) {
  const endpoints = [
    `${url}/pg/query`,
    `${url}/pg-meta/default/query`,
    `${url}/postgres/v1/query`,
  ];
  const bodies = [{ query: sql }, { sql }];
  const errors = [];
  for (const endpoint of endpoints) {
    for (const body of bodies) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        const text = await res.text();
        if (res.ok) return { ok: true, endpoint };
        errors.push(`${endpoint} ${res.status} ${text.slice(0, 120)}`);
      } catch (error) {
        errors.push(`${endpoint} ${error instanceof Error ? error.message : "fail"}`);
      }
    }
  }
  return { ok: false, errors };
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const probe = await supabase.from("products").select("id").limit(1);
console.log("probe", probe.error ? probe.error.message : `ok count=${probe.count}`);
if (probe.error) {
  const sql = await readFile("supabase/schema.sql", "utf8");
  const applied = await runSql(sql);
  if (!applied.ok) {
    console.log("sql api unavailable");
    for (const line of applied.errors.slice(0, 8)) {
      console.log(line.replaceAll(key, "[redacted]"));
    }
    throw new Error("Pokreni supabase/schema.sql u SQL Editor, pa javi.");
  }
  console.log("schema applied via", applied.endpoint.replace(url, "[project]"));
}

const products = JSON.parse(await readFile("src/data/products.json", "utf8"));
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

const { count, error } = await supabase
  .from("products")
  .select("id", { count: "exact", head: true });
if (error) throw new Error(error.message);
console.log("products in db", count);
