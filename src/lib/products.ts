import raw from "@/data/products.json";
import type { Locale } from "@/lib/i18n";

export type Category = "torbe" | "odeca" | "kape" | "papuce" | "suknje" | "ostalo";

export type PriceId = "do6" | "6-10" | "10-13" | "13plus";

export type ColorId =
  | "roze"
  | "plava"
  | "zuta"
  | "zelena"
  | "crna"
  | "bordo"
  | "bez"
  | "braon"
  | "ljubicasta"
  | "crvena"
  | "bela"
  | "sarena";

export type RawProduct = {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  price: string;
  priceLabel: string;
  category: Category;
  imageFile: string;
  sourceImage?: string;
  sourceUrl?: string;
  image: string;
  hidden?: boolean;
  featured?: boolean;
};

export type Product = RawProduct & {
  colors: ColorId[];
  hidden: boolean;
  featured: boolean;
};

const FEATURED_NAMES: Record<string, string> = {
  "zenske-letnje-heklane-papuce-pletene-papuce-za-leto-sa-heklanim-cvetom":
    "Letnje papuče sa cvetom",
  "heklana-kapa-pletena-letnja-kapa-mrezasta-kapa-za-leto": "Letnja mrežasta kapa",
  "pletena-suknja-heklana-suknja-suknja-za-plazu-heklana-plazna-suknja":
    "Heklana plažna suknja",
  "zuta-torba-sa-resama-od-rafije-torba-od-rafije-letnja-zuta-torba":
    "Žuta torba od rafije",
  "letnja-heklana-torba-sa-ruckom-u-obliku-ribe-letnja-pletena-torba-plave-boje-sa-resama-od-rafije":
    "Plava torba sa resama",
  "letnja-torba-plave-boje-sa-resama-od-rafije-i-ruckom-od-drvenih-perli":
    "Torba sa drvenim perlama",
  "clutch-torba-od-rafije-letnja-clutch-torba-letnja-tasna-rafija-torba-handmade-clutch-torba-1":
    "Clutch torba od rafije",
  "roze-torba-od-rafije-clutch-letnja-torba-od-rafije-heklana-tasna-od-rafije":
    "Roze clutch od rafije",
  "heklana-clutch-torba-sa-dva-lica-sarena-letnja-torba-sarena-clutch-torba":
    "Clutch sa dva lica",
  "heklana-torba-roze-boje-sarena-pletena-torba-handmade-tasna-letnja-torba-prolecna-torba":
    "Šarena roze torba",
  "cupavi-pleteni-ceger-heklana-ceger-torba-cupave-teksture-kivi-zelena-torba-handmade-tasna":
    "Čupavi kivi ceger",
  "heklana-clutch-torba-od-rafije-pletena-letnja-torba-handmade-clutch-tasna-sa-heklanim-cvetom":
    "Clutch sa heklanim cvetom",
  "heklana-torba-u-plavoj-boji-prolecna-letnja-pletena-torba-handmade-tasna-plave-boje":
    "Heklana torba u plavoj",
  "heklana-clutch-torba-elegantna-pletena-torba-bez-boje-prolecna-heklana-torba-sa-cvetom":
    "Bež clutch sa cvetom",
  "heklana-torba-pletena-torba-prolecna-torba-tasna-za-prolece-torba-sa-heklanim-cvetom-1":
    "Prolećna torba sa cvetom",
  "torba-od-vestacke-koze-pletena-torba-krem-boje-heklana-prolecna-torba-za-svaki-dan":
    "Krem torba za svaki dan",
  "unikat-prolecni-kardigan-u-3-boje-kardigan-od-mohera-sareni-kardigan-za-prolece":
    "UNIKAT prolećni kardigan",
  "letnja-clutch-torba-od-rafije": "Letnja clutch od rafije",
  "zenski-pleteni-dzemper-heklani-dzemper-u-vise-boja-zenski-sareni-dzemper-rucno-pleten-dzemper":
    "Šareni heklani džemper",
  "torba-od-vestackog-krzna-handmade-torba-za-svaki-dan-unikatna-heklana-zenska-torba-zimska-torba-od-vestackog-krzna":
    "Zimska torba od krzna",
  "pleteni-kardigan-heklani-kardigan-bordo-dzemper-pleteni-zenski-dzemper-boho-kardigan-heklani-dzemper-za-zene":
    "Bordo boho kardigan",
  "pletena-dzemper-haljina-kratka-pletena-haljina-zimska-haljina-zimski-dzemper-heklana-zimska-tunika-oversize-zimski-zenski-dzemper-sa-pletenicama":
    "Pletena džemper haljina",
  "sonic-zimska-kapa-decija-ski-kapa-ski-maska-fantomka-za-skijanje-zimska-kapa-za-decake":
    "Sonic ski kapa",
  "labubu-zimska-kapa-ski-kapa-ski-maska-fantomka-za-skijanje-ski-navlaka-za-kacigu-decija-zimska-kapa":
    "Labubu ski kapa",
  "romanticni-prolecni-pleteni-kardigan-sa-cvetovima-heklani-kardigan-za-prolece":
    "Kardigan sa cvetovima",
};

const FEATURED_NAMES_EN: Record<string, string> = {
  "zenske-letnje-heklane-papuce-pletene-papuce-za-leto-sa-heklanim-cvetom":
    "Summer slippers with a flower",
  "heklana-kapa-pletena-letnja-kapa-mrezasta-kapa-za-leto": "Summer mesh hat",
  "pletena-suknja-heklana-suknja-suknja-za-plazu-heklana-plazna-suknja":
    "Crochet beach skirt",
  "zuta-torba-sa-resama-od-rafije-torba-od-rafije-letnja-zuta-torba":
    "Yellow raffia bag",
  "letnja-heklana-torba-sa-ruckom-u-obliku-ribe-letnja-pletena-torba-plave-boje-sa-resama-od-rafije":
    "Blue bag with fringe",
  "letnja-torba-plave-boje-sa-resama-od-rafije-i-ruckom-od-drvenih-perli":
    "Bag with wooden beads",
  "clutch-torba-od-rafije-letnja-clutch-torba-letnja-tasna-rafija-torba-handmade-clutch-torba-1":
    "Raffia clutch bag",
  "roze-torba-od-rafije-clutch-letnja-torba-od-rafije-heklana-tasna-od-rafije":
    "Pink raffia clutch",
  "heklana-clutch-torba-sa-dva-lica-sarena-letnja-torba-sarena-clutch-torba":
    "Two-sided clutch",
  "heklana-torba-roze-boje-sarena-pletena-torba-handmade-tasna-letnja-torba-prolecna-torba":
    "Multicolor pink bag",
  "cupavi-pleteni-ceger-heklana-ceger-torba-cupave-teksture-kivi-zelena-torba-handmade-tasna":
    "Shaggy kiwi tote",
  "heklana-clutch-torba-od-rafije-pletena-letnja-torba-handmade-clutch-tasna-sa-heklanim-cvetom":
    "Clutch with a crochet flower",
  "heklana-torba-u-plavoj-boji-prolecna-letnja-pletena-torba-handmade-tasna-plave-boje":
    "Crochet bag in blue",
  "heklana-clutch-torba-elegantna-pletena-torba-bez-boje-prolecna-heklana-torba-sa-cvetom":
    "Beige clutch with a flower",
  "heklana-torba-pletena-torba-prolecna-torba-tasna-za-prolece-torba-sa-heklanim-cvetom-1":
    "Spring bag with a flower",
  "torba-od-vestacke-koze-pletena-torba-krem-boje-heklana-prolecna-torba-za-svaki-dan":
    "Cream everyday bag",
  "unikat-prolecni-kardigan-u-3-boje-kardigan-od-mohera-sareni-kardigan-za-prolece":
    "UNIQUE spring cardigan",
  "letnja-clutch-torba-od-rafije": "Summer raffia clutch",
  "zenski-pleteni-dzemper-heklani-dzemper-u-vise-boja-zenski-sareni-dzemper-rucno-pleten-dzemper":
    "Multicolor crochet sweater",
  "torba-od-vestackog-krzna-handmade-torba-za-svaki-dan-unikatna-heklana-zenska-torba-zimska-torba-od-vestackog-krzna":
    "Winter faux-fur bag",
  "pleteni-kardigan-heklani-kardigan-bordo-dzemper-pleteni-zenski-dzemper-boho-kardigan-heklani-dzemper-za-zene":
    "Burgundy boho cardigan",
  "pletena-dzemper-haljina-kratka-pletena-haljina-zimska-haljina-zimski-dzemper-heklana-zimska-tunika-oversize-zimski-zenski-dzemper-sa-pletenicama":
    "Knit sweater dress",
  "sonic-zimska-kapa-decija-ski-kapa-ski-maska-fantomka-za-skijanje-zimska-kapa-za-decake":
    "Sonic ski hat",
  "labubu-zimska-kapa-ski-kapa-ski-maska-fantomka-za-skijanje-ski-navlaka-za-kacigu-decija-zimska-kapa":
    "Labubu ski hat",
  "romanticni-prolecni-pleteni-kardigan-sa-cvetovima-heklani-kardigan-za-prolece":
    "Cardigan with flowers",
};

function translateName(name: string) {
  const translated = name
    .replace(/heklan[aeio]?/gi, "crochet")
    .replace(/pleten[aeio]?/gi, "knit")
    .replace(/džemper/gi, "sweater")
    .replace(/dzemper/gi, "sweater")
    .replace(/kardigan/gi, "cardigan")
    .replace(/torba/gi, "bag")
    .replace(/tašna|tasna/gi, "bag")
    .replace(/ceger/gi, "tote")
    .replace(/papuče|papuce/gi, "slippers")
    .replace(/suknja/gi, "skirt")
    .replace(/kapa/gi, "hat")
    .replace(/jakna/gi, "jacket")
    .replace(/haljina/gi, "dress")
    .replace(/letnj[aei]/gi, "summer")
    .replace(/zimsk[aei]/gi, "winter")
    .replace(/prolećn[aei]|prolecn[aei]/gi, "spring")
    .replace(/jesenj[aei]/gi, "autumn")
    .replace(/žensk[aei]|zensk[aei]/gi, "women's")
    .replace(/šarena|sarena/gi, "multicolor")
    .replace(/ručno|rucno/gi, "handmade")
    .replace(/školjka|skoljka/gi, "shell")
    .replace(/čupav[aei]|cupav[aei]/gi, "shaggy")
    .replace(/\s+/g, " ")
    .trim();
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

export function productName(product: Product, locale: Locale) {
  if (locale === "sr") return product.name;
  return FEATURED_NAMES_EN[product.slug] ?? translateName(product.name);
}

function tidyName(name: string) {
  const cleaned = name
    .replace(/\b(Clutch|Handmade|UNIKAT|Sonic|Teddy|Labubu|Floral|Dino|Cat|Bunny|Bunny's|Valentine's|Hearts)\b/g, (m) => m)
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export const colorFilters: {
  id: ColorId;
  label: string;
  hex: string;
}[] = [
  { id: "roze", label: "Roze", hex: "#e38aa6" },
  { id: "plava", label: "Plava", hex: "#6fa4d8" },
  { id: "zuta", label: "Žuta", hex: "#e8c14a" },
  { id: "zelena", label: "Zelena", hex: "#7aaa6a" },
  { id: "bordo", label: "Bordo", hex: "#8a1630" },
  { id: "crvena", label: "Crvena", hex: "#c43b3b" },
  { id: "ljubicasta", label: "Ljubičasta", hex: "#8d6bb8" },
  { id: "braon", label: "Braon", hex: "#8b5e3c" },
  { id: "bez", label: "Bež / krem", hex: "#e6d3b8" },
  { id: "bela", label: "Bela", hex: "#f6f2ea" },
  { id: "crna", label: "Crna", hex: "#1d1a19" },
  { id: "sarena", label: "Šarena", hex: "conic-gradient(#e38aa6,#e8c14a,#6fa4d8,#7aaa6a,#8d6bb8)" },
];

function inferColors(slug: string, fullName: string): ColorId[] {
  const text = `${slug} ${fullName}`.toLowerCase();
  const found = new Set<ColorId>();

  if (/zuta|žuta/.test(text)) found.add("zuta");
  if (/plav|teget/.test(text)) found.add("plava");
  if (/roze/.test(text)) found.add("roze");
  if (/zelen|kivi/.test(text)) found.add("zelena");
  if (/bordo/.test(text)) found.add("bordo");
  if (/crven/.test(text)) found.add("crvena");
  if (/ljubicast|ljubičast/.test(text)) found.add("ljubicasta");
  if (/braon|kapucin|zemljan/.test(text)) found.add("braon");
  if (/\bbez\b|bež|krem/.test(text)) found.add("bez");
  if (/\bbel[ae]\b/.test(text)) found.add("bela");
  if (/crn[ae]/.test(text)) found.add("crna");
  if (/saren|šaren|vise-boja|više boja|3-boje|3 boje|floral|orhidej/.test(text)) {
    found.add("sarena");
  }
  if (/sonic|labubu|dino|teddy|bunny|cat-ski/.test(text)) found.add("sarena");
  if (found.size === 0 && /rafij|pruca|pruć|bambus|skoljk|školjk/.test(text)) {
    found.add("bez");
  }
  if (found.size === 0) found.add("sarena");
  return [...found];
}

export const featuredSlugs = [
  "unikat-prolecni-kardigan-u-3-boje-kardigan-od-mohera-sareni-kardigan-za-prolece",
  "zuta-torba-sa-resama-od-rafije-torba-od-rafije-letnja-zuta-torba",
  "letnja-heklana-torba-sa-ruckom-u-obliku-ribe-letnja-pletena-torba-plave-boje-sa-resama-od-rafije",
  "zenske-letnje-heklane-papuce-pletene-papuce-za-leto-sa-heklanim-cvetom",
  "roze-torba-od-rafije-clutch-letnja-torba-od-rafije-heklana-tasna-od-rafije",
  "heklana-clutch-torba-sa-dva-lica-sarena-letnja-torba-sarena-clutch-torba",
  "cupavi-pleteni-ceger-heklana-ceger-torba-cupave-teksture-kivi-zelena-torba-handmade-tasna",
  "zenski-pleteni-dzemper-heklani-dzemper-u-vise-boja-zenski-sareni-dzemper-rucno-pleten-dzemper",
  "pletena-suknja-heklana-suknja-suknja-za-plazu-heklana-plazna-suknja",
  "pleteni-kardigan-heklani-kardigan-bordo-dzemper-pleteni-zenski-dzemper-boho-kardigan-heklani-dzemper-za-zene",
  "heklana-kapa-pletena-letnja-kapa-mrezasta-kapa-za-leto",
  "sonic-zimska-kapa-decija-ski-kapa-ski-maska-fantomka-za-skijanje-zimska-kapa-za-decake",
];

export function hydrateProduct(product: RawProduct): Product {
  return {
    ...product,
    name: FEATURED_NAMES[product.slug] ?? tidyName(product.name),
    fullName: product.fullName,
    sourceImage: product.sourceImage ?? "",
    sourceUrl: product.sourceUrl ?? "",
    imageFile: product.imageFile || product.image.replace(/^\/products\//, ""),
    colors: inferColors(product.slug, product.fullName),
    hidden: Boolean(product.hidden),
    featured: product.featured ?? featuredSlugs.includes(product.slug),
  };
}

const hydrated = (raw as RawProduct[]).map(hydrateProduct);

export const allProducts = hydrated;
export const products: Product[] = hydrated.filter((product) => !product.hidden);

export const priceFilters: {
  id: PriceId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "do6", label: "Do 6.000", min: 0, max: 6000 },
  { id: "6-10", label: "6.000 – 10.000", min: 6001, max: 10000 },
  { id: "10-13", label: "10.000 – 13.000", min: 10001, max: 13000 },
  { id: "13plus", label: "Preko 13.000", min: 13001, max: Number.POSITIVE_INFINITY },
];

export const categories: { id: Category | "sve"; label: string }[] = [
  { id: "sve", label: "Sve" },
  { id: "torbe", label: "Torbe" },
  { id: "odeca", label: "Džemperi i kardigani" },
  { id: "kape", label: "Kape" },
  { id: "papuce", label: "Papuče" },
  { id: "suknje", label: "Suknje" },
];

export const adminCategories: { id: Category; label: string }[] = [
  { id: "torbe", label: "Torbe" },
  { id: "odeca", label: "Džemperi i kardigani" },
  { id: "kape", label: "Kape" },
  { id: "papuce", label: "Papuče" },
  { id: "suknje", label: "Suknje" },
  { id: "ostalo", label: "Ostalo" },
];

export function featuredFrom(list: Product[]) {
  const flagged = list.filter((product) => product.featured);
  if (flagged.length > 0) return flagged;
  return featuredSlugs
    .map((slug) => list.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
}

const flaggedFeatured = products.filter((product) => product.featured);

export const featuredProducts = featuredFrom(products);

export function inPriceRange(product: Product, price: PriceId | "sve") {
  if (price === "sve") return true;
  const range = priceFilters.find((item) => item.id === price);
  if (!range) return true;
  const value = priceValue(product.price);
  return value >= range.min && value <= range.max;
}

export function filterProducts(
  category: Category | "sve",
  color: ColorId | "sve" = "sve",
  price: PriceId | "sve" = "sve",
  list: Product[] = products,
) {
  return list.filter((product) => {
    const byCategory = category === "sve" || product.category === category;
    const byColor = color === "sve" || product.colors.includes(color);
    return byCategory && byColor && inPriceRange(product, price);
  });
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function priceValue(price: string) {
  return Number(price.replace(/\./g, ""));
}

export function formatRsd(value: number) {
  return `${value.toLocaleString("sr-RS")} RSD`;
}

export function categoryLabel(category: Category) {
  return (
    categories.find((item) => item.id === category)?.label ?? "Kolekcija"
  );
}
