import { deleteAdminMessage, markAdminMessageRead } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { readMessages } from "@/lib/messages";

function formatWhen(value: string) {
  return new Date(value).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await readMessages();

  return (
    <div>
      <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Kontakt</p>
      <h1 className="mt-2 font-serif text-5xl">Poruke</h1>
      <p className="mt-3 text-sm text-ink/65">
        Poruke sa kontakt forme na sajtu.
      </p>

      <div className="mt-8 space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {message.name}
                  {!message.read ? (
                    <span className="ml-2 text-[11px] text-rose uppercase">novo</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted">
                  {message.email}
                  {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                  {formatWhen(message.createdAt)}
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                {!message.read ? (
                  <form action={markAdminMessageRead}>
                    <input type="hidden" name="id" value={message.id} />
                    <button type="submit" className="underline">
                      Pročitano
                    </button>
                  </form>
                ) : null}
                <form action={deleteAdminMessage}>
                  <input type="hidden" name="id" value={message.id} />
                  <button type="submit" className="text-rose underline">
                    Obriši
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
              {message.message}
            </p>
            <div className="mt-4 flex gap-4 text-xs">
              <a href={`mailto:${message.email}`} className="underline">
                Odgovori emailom
              </a>
              {message.phone ? (
                <a href={`tel:${message.phone}`} className="underline">
                  Pozovi
                </a>
              ) : null}
            </div>
          </article>
        ))}
        {messages.length === 0 ? (
          <p className="border border-ink/10 bg-white px-5 py-8 text-sm text-muted">
            Nema poruka.
          </p>
        ) : null}
      </div>
    </div>
  );
}
