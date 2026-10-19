import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "src", "data");

const PAGES = [1, 2, 3, 4, 5];

function cleanName(raw) {
  return raw
    .replace(/\s+/g, " ")
    .replace(/^ADD\s*/i, "")
    .replace(/^MIRKA with love\s*/i, "")
    .trim();
}

function shortName(name) {
  const parts = name
    .split(/(?=[A-ZŠĐŽČĆ])|(?<=\s)/)
    .join("")
    .trim();
  const first = name.split(/\s{2,}| (?=[A-ZŠĐŽČĆ][a-zčćžšđ])/)[0] || name;
  const cut = name.match(
    /^(Ženske letnje heklane papuče|Heklana kapa|Pletena suknja|Žuta torba sa resama od rafije|Letnja heklana torba sa ručkom u obliku ribe|Letnja torba plave boje sa resama od rafije i ručkom od drvenih perli|Clutch torba od rafije|Roze torba od rafije|Heklana clutch torba sa dva lica|Heklana torba roze boje|Čupavi pleteni ceger|Heklana clutch torba od rafije|Heklana torba u plavoj boji|Heklana clutch torba|Heklana torba|Torba od veštačke kože|UNIKAT Prolećni kardigan u 3 boje|Letnja clutch torba od rafije|Ženski pleteni džemper|Torba od veštačkog krzna|Crna torba|Bordo handmade torba|Pleteni kardigan|Prolećna handmade torba|Krznena zimska torba|Pletena džemper haljina|Ženska čupava jakna sa resama|Sonic Zimska Kapa|Labubu Zimska Kapa|UNIKAT Ženska čupava jakna sa resama)/
  );
  if (cut) return cut[1];
  return first.length > 62 ? `${first.slice(0, 59)}…` : first;
}

function inferCategory(name) {
  const n = name.toLowerCase();
  if (/papuč/.test(n)) return "papuce";
  if (/suknj/.test(n)) return "suknje";
  if (/kardigan|džemper|dzemper|haljina|tunika|blejzer|jakna/.test(n)) return "odeca";
  if (/kapa|fantom|balaclava|šešir|sesir|ski/.test(n)) return "kape";
  if (/torba|tašna|tasna|ceger|clutch/.test(n)) return "torbe";
  return "ostalo";
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36",
      accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

function parseProducts(html) {
  const products = [];
  const blocks = html.split(/class="product-card"/).slice(1);

  for (const block of blocks) {
    const slug = block.match(/href="(\/product\/[^"#?]+)"/)?.[1];
    const image = block.match(
      /product_list\/uploads\/product\/([a-z0-9]+\.(?:jpg|jpeg|png|webp))/i
    )?.[1];
    const price = block.match(/([\d.]+)\s*RSD/)?.[1];
    const title = block.match(
      /product-item-link[^>]*>([\s\S]*?)<\/a>/i
    )?.[1];
    if (!slug || !image || !price) continue;

    const name = cleanName(
      (title || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );

    products.push({
      id: slug.replace("/product/", ""),
      slug: slug.replace("/product/", ""),
      name: shortName(name) || name,
      fullName: name,
      price,
      priceLabel: `${price} RSD`,
      category: inferCategory(name),
      imageFile: image,
      sourceImage: `https://imade.shop/uploads/product/${image}`,
      sourceUrl: `https://imade.shop${slug}`,
    });
  }

  return products;
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok || !res.body) {
    throw new Error(`download fail ${url} ${res.status}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

const collected = new Map();

for (const page of PAGES) {
  const url =
    page === 1
      ? "https://imade.shop/brand/mirka-with-love"
      : `https://imade.shop/brand/mirka-with-love?page=${page}`;
  console.log("fetch", url);
  const html = await fetchText(url);
  const items = parseProducts(html);
  console.log(`page ${page}: ${items.length}`);
  for (const item of items) {
    if (!collected.has(item.id)) collected.set(item.id, item);
  }
}

await mkdir(path.join(PUBLIC_DIR, "products"), { recursive: true });
await mkdir(path.join(PUBLIC_DIR, "brand"), { recursive: true });
await mkdir(DATA_DIR, { recursive: true });

const logoDest = path.join(PUBLIC_DIR, "brand", "logo.png");
const coverDest = path.join(PUBLIC_DIR, "brand", "cover.png");

try {
  await download(
    "https://imade.shop/uploads/business/logo/abed9ba1-3e57-11f1-9195-107c6146d8f5.png",
    logoDest
  );
  console.log("logo ok");
} catch (e) {
  console.warn(e.message);
}

try {
  await download(
    "https://imade.shop/uploads/business/abee0c60-3e57-11f1-9195-107c6146d8f5.png",
    coverDest
  );
  console.log("cover ok");
} catch (e) {
  console.warn("cover fallback cache");
  await download(
    "https://imade.shop/media/cache/business_cover/uploads/business/abee0c60-3e57-11f1-9195-107c6146d8f5.png",
    coverDest
  );
}

const products = [...collected.values()];

for (const product of products) {
  const dest = path.join(PUBLIC_DIR, "products", product.imageFile);
  try {
    await download(product.sourceImage, dest);
    product.image = `/products/${product.imageFile}`;
    console.log("img", product.imageFile);
  } catch {
    const cache = `https://imade.shop/media/cache/product_list/uploads/product/${product.imageFile}`;
    await download(cache, dest);
    product.image = `/products/${product.imageFile}`;
    console.log("img cache", product.imageFile);
  }
}

await writeFile(
  path.join(DATA_DIR, "products.json"),
  JSON.stringify(products, null, 2),
  "utf8"
);

console.log(`done ${products.length} products`);
