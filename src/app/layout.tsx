import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { cookies, headers } from "next/headers";
import { ComingSoon } from "@/components/ComingSoon";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { PREVIEW_COOKIE, verifyPreviewToken } from "@/lib/preview-auth";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
});

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const locale = (headerList.get("x-locale") === "en" ? "en" : "sr") as Locale;
  const dict = getDictionary(locale);
  return {
    title: {
      default: dict.meta.title,
      template: "%s | MIRKA with love",
    },
    description: dict.meta.description,
    alternates: {
      languages: {
        sr: "/",
        en: "/en",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const headerList = await headers();
  const locale = headerList.get("x-locale") === "en" ? "en" : "sr";
  const path = headerList.get("x-mirka-path") || "";
  const unlocked = await verifyPreviewToken(
    (await cookies()).get(PREVIEW_COOKIE)?.value,
  );
  const isAdmin = path.startsWith("/admin");
  const body = isAdmin || unlocked ? children : <ComingSoon />;

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{body}</body>
    </html>
  );
}
