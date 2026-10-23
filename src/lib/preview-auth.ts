export const PREVIEW_COOKIE = "mirka_uskoro";
const WEEK = 60 * 60 * 24 * 14;

function password() {
  return (process.env.SITE_PREVIEW_PASSWORD || "1706").trim();
}

function secretBytes() {
  const raw =
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    password();
  return new TextEncoder().encode(raw);
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function equal(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toHex(signature);
}

export function checkPreviewPassword(input: string) {
  return equal(input.trim(), password());
}

export async function createPreviewToken() {
  const exp = Date.now() + WEEK * 1000;
  const payload = `ok.${exp}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifyPreviewToken(token: string | undefined) {
  try {
    if (!token) return false;
    const lastDot = token.lastIndexOf(".");
    if (lastDot < 0) return false;
    const payload = token.slice(0, lastDot);
    const signature = token.slice(lastDot + 1);
    const expected = await sign(payload);
    if (!equal(signature, expected)) return false;
    const exp = Number(payload.split(".")[1]);
    return Number.isFinite(exp) && exp > Date.now();
  } catch {
    return false;
  }
}
