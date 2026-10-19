"use client";

import { useState } from "react";
import { sendShopMessage } from "@/app/admin/actions";
import { useI18n } from "@/components/LocaleProvider";
import { site, whatsappHref } from "@/lib/site";

export function ContactForm() {
  const { dict } = useI18n();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);
        try {
          await sendShopMessage(form);
          setSent(true);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Poruka nije sačuvana. Pokušajte ponovo.",
          );
        } finally {
          setSaving(false);
        }
      }}
    >
      <label className="block text-sm">
        {dict.contact.name}
        <input
          required
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        {dict.contact.email}
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        {dict.contact.phone}
        <input
          value={form.phone}
          onChange={(event) => update("phone", event.target.value)}
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        {dict.contact.message}
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
      </label>

      {error ? (
        <p className="border border-rose/30 bg-blush/40 px-4 py-3 text-sm">{error}</p>
      ) : null}

      {sent ? (
        <p className="border border-ink/10 bg-paper px-4 py-3 text-sm">
          {dict.contact.thanks.replace("{name}", form.name)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-solid" disabled={saving}>
          {saving ? "…" : dict.contact.send}
        </button>
        <a
          href={whatsappHref(
            `${dict.contact.waHello.replace("{name}", form.name || "...")}\n${form.message || dict.contact.waFallback}\nTel: ${form.phone || "-"}\nEmail: ${form.email || "-"}`,
          )}
          target="_blank"
          rel="noreferrer"
          className="btn-line"
        >
          WhatsApp
        </a>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent(dict.contact.mailSubject)}&body=${encodeURIComponent(`${form.name}\n${form.phone}\n${form.email}\n\n${form.message}`)}`}
          className="btn-line"
        >
          Email
        </a>
      </div>
    </form>
  );
}
