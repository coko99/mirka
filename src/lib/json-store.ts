import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "src", "data");

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>) {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(DATA_DIR, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filename: string, value: unknown) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    path.join(DATA_DIR, filename),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

export function mutateJsonFile<T>(
  filename: string,
  fallback: T,
  mutate: (current: T) => T | Promise<T>,
) {
  return withLock(async () => {
    const current = await readJsonFile<T>(filename, fallback);
    const next = await mutate(current);
    await writeJsonFile(filename, next);
    return next;
  });
}
