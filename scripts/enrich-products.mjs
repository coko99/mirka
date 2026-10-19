import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file = path.resolve(import.meta.dirname, "../src/data/products.json");
const products = JSON.parse(await readFile(file, "utf8"));

const WORD = {
  zenske: "Ženske",
  zenski: "Ženski",
  zenska: "Ženska",
  zene: "žene",
  letnje: "letnje",
  letnja: "letnja",
  letnji: "letnji",
  heklane: "heklane",
  heklana: "heklana",
  heklani: "heklani",
  heklanim: "heklanim",
  heklanim: "heklanim",
  pletene: "pletene",
  pletena: "pletena",
  pleteni: "pleteni",
  papuce: "papuče",
  kapa: "kapa",
  mrezasta: "mrežasta",
  suknja: "suknja",
  plazu: "plažu",
  plazna: "plažna",
  plazni: "plažni",
  zuta: "žuta",
  torba: "torba",
  torbe: "torbe",
  resama: "resama",
  rafije: "rafije",
  rafija: "rafija",
  ruckom: "ručkom",
  ruckama: "ručkama",
  obliku: "obliku",
  ribe: "ribe",
  plave: "plave",
  boje: "boje",
  boji: "boji",
  drvenih: "drvenih",
  perli: "perli",
  tasna: "tašna",
  handmade: "handmade",
  roze: "roze",
  sarena: "šarena",
  sareni: "šareni",
  cupavi: "čupavi",
  cupava: "čupava",
  cupave: "čupave",
  ceger: "ceger",
  teksture: "teksture",
  kivi: "kivi",
  zelena: "zelena",
  prolecna: "prolećna",
  prolecni: "prolećni",
  prolece: "proleće",
  elegantna: "elegantna",
  elegantni: "elegantni",
  elegantnu: "elegantnu",
  bez: "bež",
  cvetom: "cvetom",
  cvetovima: "cvetovima",
  vestacke: "veštačke",
  vestackog: "veštačkog",
  koze: "kože",
  krem: "krem",
  unikat: "UNIKAT",
  unikatna: "unikatna",
  unikatni: "unikatni",
  kardigan: "kardigan",
  mohera: "mohera",
  ljubicaste: "ljubičaste",
  dzemper: "džemper",
  vise: "više",
  boja: "boja",
  rucno: "ručno",
  pleten: "pleten",
  krzna: "krzna",
  zimska: "zimska",
  zimski: "zimski",
  crna: "crna",
  crne: "crne",
  crvene: "crvene",
  radena: "rađena",
  bordo: "bordo",
  bambus: "bambus",
  bambusa: "bambusa",
  boho: "boho",
  haljina: "haljina",
  kratka: "kratka",
  tunika: "tunika",
  oversize: "oversize",
  pletenicama: "pletenicama",
  jakna: "jakna",
  kapucino: "kapućino",
  sonic: "Sonic",
  teddy: "Teddy",
  ski: "ski",
  maska: "maska",
  fantomka: "fantomka",
  skijanje: "skijanje",
  labubu: "Labubu",
  navlaka: "navlaka",
  kacigu: "kacigu",
  nijansama: "nijansama",
  jesenji: "jesenji",
  jesenja: "jesenja",
  jesen: "jesen",
  braon: "braon",
  tonovima: "tonovima",
  zimu: "zimu",
  zeleni: "zeleni",
  svecane: "svečane",
  svecana: "svečana",
  prilike: "prilike",
  vintage: "vintage",
  stilu: "stilu",
  posao: "posao",
  velika: "velika",
  orhidejama: "orhidejama",
  skoljke: "školjke",
  skoljka: "školjka",
  morska: "morska",
  morskim: "morskim",
  motivima: "motivima",
  zlatno: "zlatno",
  srebrna: "srebrna",
  zlatne: "zlatne",
  srebrne: "srebrne",
  drvenim: "drvenim",
  okvirom: "okvirom",
  bisernom: "bisernom",
  biserima: "biserima",
  pruca: "pruća",
  okrugli: "okrugli",
  neobicna: "neobična",
  neobicnom: "neobičnom",
  teget: "teget",
  pastelno: "pastelno",
  zelene: "zelene",
  bele: "bele",
  bela: "bela",
  zemljanim: "zemljanim",
  zihernadle: "zihernadle",
  romanticna: "romantična",
  romanticni: "romantični",
  floral: "Floral",
  dino: "Dino",
  cat: "Cat",
  bunny: "Bunny",
  bunnys: "Bunny's",
  hearts: "Hearts",
  heart: "Heart",
  with: "with",
  dva: "dva",
  lica: "lica",
  svaki: "svaki",
  dan: "dan",
  leto: "leto",
  sa: "sa",
  od: "od",
  za: "za",
  u: "u",
  i: "i",
  na: "na",
};

function titleCaseWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function fromSlug(slug) {
  const parts = slug.replace(/-\d+$/, "").split("-").filter(Boolean);
  const words = parts.map((w) => WORD[w] || titleCaseWord(w));
  const full = words.join(" ").replace(/\s+/g, " ").trim();
  const stopAfter = new Set([
    "papuče",
    "kapa",
    "suknja",
    "torba",
    "tašna",
    "ceger",
    "kardigan",
    "džemper",
    "haljina",
    "tunika",
    "jakna",
    "fantomka",
  ]);
  const short = [];
  for (const word of words) {
    short.push(word);
    if (short.length >= 3 && stopAfter.has(word.toLowerCase())) break;
    if (short.length >= 7) break;
  }
  return { full, short: short.join(" ") };
}

function categoryFrom(name) {
  const n = name.toLowerCase();
  if (/papuč/.test(n)) return "papuce";
  if (/suknj/.test(n)) return "suknje";
  if (/kapa|fantom|balaclava|šešir|ski maska/.test(n)) return "kape";
  if (/kardigan|džemper|haljina|tunika|blejzer|jakna/.test(n)) return "odeca";
  if (/torba|tašna|ceger|clutch/.test(n)) return "torbe";
  return "ostalo";
}

const enriched = products.map((p) => {
  const { full, short } = fromSlug(p.slug);
  return {
    ...p,
    name: short,
    fullName: full,
    category: categoryFrom(full),
  };
});

await writeFile(file, JSON.stringify(enriched, null, 2), "utf8");
console.log("enriched", enriched.length);
console.log(enriched.slice(0, 8).map((p) => `${p.name} | ${p.category} | ${p.priceLabel}`).join("\n"));
