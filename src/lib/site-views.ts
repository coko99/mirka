import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { calendarDay } from "@/lib/calendar";
import {
  getSupabase,
  isMissingRelation,
  isSupabaseConfigured,
} from "@/lib/supabase";

export const SITE_PAGES = [
  "pocetna",
  "kolekcija",
  "proizvod",
  "korpa",
  "kontakt",
  "o-nama",
  "porudzbina",
  "ostalo",
] as const;

export type SitePage = (typeof SITE_PAGES)[number];

export type SiteView = {
  id: string;
  createdAt: string;
  day: string;
  page: SitePage;
  slug: string;
  visitor: string;
  uniqueDay: boolean;
};

type ViewRow = {
  id: string;
  created_at: string;
  day: string;
  page: string;
  slug: string;
  visitor: string;
  unique_day: boolean;
};

const KEEP = 8000;
const PROJECT_FILE = path.join(process.cwd(), "src", "data", "site-views.json");
const TEMP_FILE = path.join(tmpdir(), "mirka-site-views.json");

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>) {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readLocalViews() {
  for (const file of [PROJECT_FILE, TEMP_FILE]) {
    try {
      return JSON.parse(await readFile(file, "utf8")) as SiteView[];
    } catch {
      continue;
    }
  }
  return [] as SiteView[];
}

async function writeLocalViews(views: SiteView[]) {
  const payload = `${JSON.stringify(views.slice(0, KEEP))}\n`;
  try {
    await writeFile(PROJECT_FILE, payload, "utf8");
  } catch {
    await writeFile(TEMP_FILE, payload, "utf8");
  }
}

export const sitePageLabel: Record<SitePage, string> = {
  pocetna: "Početna",
  kolekcija: "Kolekcija",
  proizvod: "Proizvod",
  korpa: "Korpa",
  kontakt: "Kontakt",
  "o-nama": "O nama",
  porudzbina: "Potvrda",
  ostalo: "Ostalo",
};

export function parseSitePath(raw: string) {
  let path = raw.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 180) path = path.slice(0, 180);
  path = path.replace(/^\/en(?=\/|$)/, "") || "/";
  path = path.replace(/^\/sr(?=\/|$)/, "") || "/";
  if (path.length > 1) path = path.replace(/\/$/, "");

  if (path.startsWith("/admin") || path.startsWith("/api")) return null;
  if (path === "/" || path === "") {
    return { page: "pocetna" as const, slug: "" };
  }
  if (path === "/kolekcija") return { page: "kolekcija" as const, slug: "" };
  if (path === "/korpa") return { page: "korpa" as const, slug: "" };
  if (path === "/kontakt") return { page: "kontakt" as const, slug: "" };
  if (path === "/o-nama") return { page: "o-nama" as const, slug: "" };
  const product = path.match(/^\/proizvod\/([a-z0-9-]+)$/i);
  if (product) {
    return { page: "proizvod" as const, slug: product[1].toLowerCase() };
  }
  if (path.startsWith("/porudzbina/")) {
    return { page: "porudzbina" as const, slug: "" };
  }
  return { page: "ostalo" as const, slug: "" };
}

function fromRow(row: ViewRow): SiteView {
  return {
    id: row.id,
    createdAt: row.created_at,
    day: String(row.day).slice(0, 10),
    page: SITE_PAGES.includes(row.page as SitePage)
      ? (row.page as SitePage)
      : "ostalo",
    slug: row.slug || "",
    visitor: row.visitor,
    uniqueDay: Boolean(row.unique_day),
  };
}

function toRow(view: SiteView): ViewRow {
  return {
    id: view.id,
    created_at: view.createdAt,
    day: view.day,
    page: view.page,
    slug: view.slug,
    visitor: view.visitor,
    unique_day: view.uniqueDay,
  };
}

async function appendJson(view: SiteView) {
  await withLock(async () => {
    const current = await readLocalViews();
    await writeLocalViews([view, ...current]);
  });
}

async function tryAppendJson(view: SiteView) {
  try {
    await appendJson(view);
  } catch (error) {
    console.error(
      "site_views json",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function recordSiteView(input: {
  path: string;
  visitor: string;
  uniqueDay: boolean;
}) {
  const parsed = parseSitePath(input.path);
  if (!parsed) return;
  const view: SiteView = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    day: calendarDay(),
    page: parsed.page,
    slug: parsed.slug,
    visitor: input.visitor,
    uniqueDay: input.uniqueDay,
  };

  try {
    if (!isSupabaseConfigured()) {
      await tryAppendJson(view);
      return;
    }

    const { error } = await getSupabase().from("site_views").insert(toRow(view));
    if (!error) return;
    if (isMissingRelation(error)) {
      await tryAppendJson(view);
      return;
    }
    console.error("site_views", error.message);
    await tryAppendJson(view);
  } catch (error) {
    console.error(
      "site_views",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function readSiteViews(sinceDay: string) {
  if (!isSupabaseConfigured()) {
    const views = await readLocalViews();
    return views.filter((view) => view.day >= sinceDay);
  }

  const { data, error } = await getSupabase()
    .from("site_views")
    .select("*")
    .gte("day", sinceDay)
    .order("created_at", { ascending: false })
    .limit(20000);

  if (error) {
    if (!isMissingRelation(error)) {
      console.error("site_views", error.message);
    }
    const views = await readLocalViews();
    return views.filter((view) => view.day >= sinceDay);
  }
  return ((data ?? []) as ViewRow[]).map(fromRow);
}
