import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";
import { readMessages } from "@/lib/messages";
import { readOrders } from "@/lib/orders";

const links = [
  { href: "/admin", label: "Pregled" },
  { href: "/admin/proizvodi", label: "Proizvodi" },
  { href: "/admin/narudzbine", label: "Narudžbine" },
  { href: "/admin/poruke", label: "Poruke" },
];

export async function AdminNav() {
  const [orders, messages] = await Promise.all([readOrders(), readMessages()]);
  const newOrders = orders.filter((order) => order.status === "nova").length;
  const unread = messages.filter((message) => !message.read).length;

  return (
    <aside className="border-b border-ink/10 bg-paper px-5 py-5 md:border-r md:border-b-0 md:px-6 md:py-8">
      <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Atelje</p>
      <Link href="/admin" className="mt-2 block font-serif text-3xl leading-none">
        Admin
      </Link>
      <nav className="mt-8 flex flex-wrap gap-4 md:flex-col md:gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm tracking-wide text-ink/70 hover:text-ink"
          >
            {link.label}
            {link.href === "/admin/narudzbine" && newOrders > 0 ? (
              <span className="ml-2 text-xs text-rose">{newOrders}</span>
            ) : null}
            {link.href === "/admin/poruke" && unread > 0 ? (
              <span className="ml-2 text-xs text-rose">{unread}</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="mt-8 flex flex-wrap items-center gap-4 text-xs">
        <Link href="/" className="underline">
          Otvori sajt
        </Link>
        <form action={logoutAdmin}>
          <button type="submit" className="underline">
            Odjavi se
          </button>
        </form>
      </div>
    </aside>
  );
}
