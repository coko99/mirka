"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PREVIEW_COOKIE,
  checkPreviewPassword,
  createPreviewToken,
} from "@/lib/preview-auth";

const WEEK = 60 * 60 * 24 * 14;

export async function unlockPreview(
  _prev: { error?: string } | null,
  formData: FormData,
) {
  const password = String(formData.get("password") || "");
  if (!checkPreviewPassword(password)) {
    return { error: "Pogrešna šifra." };
  }
  const store = await cookies();
  store.set(PREVIEW_COOKIE, await createPreviewToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  });
  redirect("/");
}
