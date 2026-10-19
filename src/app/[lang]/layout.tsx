import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LocaleProvider } from "@/components/LocaleProvider";
import { CartProvider } from "@/lib/cart";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <CartProvider>
      <LocaleProvider locale={lang} dict={dict}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </LocaleProvider>
    </CartProvider>
  );
}
