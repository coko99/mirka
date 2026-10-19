import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.contact.metaTitle,
    description: dict.contact.metaDescription,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <section className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
            {dict.contact.kicker}
          </p>
          <h1 className="mt-3 font-serif text-6xl leading-none md:text-8xl">
            {dict.contact.title}
          </h1>
          <p className="mt-5 text-ink/65">{dict.contact.intro}</p>

          <div className="mt-10 space-y-6">
            <p>
              <span className="block text-[11px] tracking-[0.18em] text-muted uppercase">
                {dict.contact.phone}
              </span>
              <a href={`tel:${site.phoneTel}`} className="font-serif text-3xl">
                {site.phoneDisplay}
              </a>
            </p>
            <p>
              <span className="block text-[11px] tracking-[0.18em] text-muted uppercase">
                {dict.contact.email}
              </span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            {site.shops.map((shop) => (
              <p key={shop.name}>
                <span className="block text-[11px] tracking-[0.18em] text-muted uppercase">
                  {shop.name}
                </span>
                {shop.address}
              </p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn-solid"
            >
              WhatsApp
            </a>
            <a href={site.viber} className="btn-line">
              Viber
            </a>
            <a href={`tel:${site.phoneTel}`} className="btn-line">
              {dict.contact.call}
            </a>
          </div>
        </div>

        <div className="border border-ink/10 bg-paper p-6 md:p-10 lg:col-span-7">
          <h2 className="font-serif text-4xl">{dict.contact.formTitle}</h2>
          <p className="mt-2 mb-8 text-sm text-ink/55">{dict.contact.formIntro}</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
