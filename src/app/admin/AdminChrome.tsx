"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Pregled" },
  { href: "/admin/proizvodi", label: "Proizvodi" },
  { href: "/admin/narudzbine", label: "Narudžbine" },
  { href: "/admin/poruke", label: "Poruke" },
];

export function AdminChrome({
  newOrders,
  unread,
}: {
  newOrders: number;
  unread: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-white/10 bg-ink text-cream md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:border-r md:border-b-0">
      <div className="px-5 py-5 md:px-6 md:py-8">
        <p className="text-[10px] tracking-[0.28em] text-cream/45 uppercase">
          Atelje
        </p>
        <Link href="/admin" className="mt-2 block font-serif text-3xl leading-none">
          MIRKA
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:gap-1 md:px-4">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          const badge =
            link.href === "/admin/narudzbine"
              ? newOrders
              : link.href === "/admin/poruke"
                ? unread
                : 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center justify-between rounded-2xl px-3 py-2.5 text-sm ${
                active
                  ? "bg-cream text-ink"
                  : "text-cream/70 hover:bg-white/8 hover:text-cream"
              }`}
            >
              <span>{link.label}</span>
              {badge > 0 ? (
                <span
                  className={`ml-3 rounded-full px-2 py-0.5 text-[10px] ${
                    active ? "bg-rose text-cream" : "bg-rose/90 text-cream"
                  }`}
                >
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-4 px-5 py-4 text-xs text-cream/55 md:px-6 md:pb-8">
        <Link href="/" className="hover:text-cream">
          Sajt
        </Link>
        <form action={logoutAdmin}>
          <button type="submit" className="hover:text-cream">
            Odjava
          </button>
        </form>
      </div>
    </aside>
  );
}
