import { UnlockForm } from "@/app/uskoro/UnlockForm";
import { site } from "@/lib/site";

export function ComingSoon() {
  return (
    <main className="grid min-h-full place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-paper p-8 shadow-[0_24px_60px_-32px_rgba(20,17,16,0.5)] md:p-10">
        <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
          {site.name}
        </p>
        <h1 className="mt-3 font-serif text-6xl">Uskoro</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/65">
          Sajt se priprema. Ako imate šifru, možete pogledati kako napreduje.
        </p>
        <UnlockForm />
        <p className="mt-8 text-xs text-muted">
          <a
            href={site.instagram}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          {" · "}
          {site.email}
        </p>
      </div>
    </main>
  );
}
