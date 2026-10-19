import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminNav } from "@/app/admin/AdminNav";

export const metadata: Metadata = {
    title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await isAdminSession();

  return (
    <div className="min-h-full bg-cream text-ink">
      {authed ? (
        <div className="md:grid md:min-h-full md:grid-cols-[240px_1fr]">
          <AdminNav />
          <div className="px-5 py-8 md:px-10 md:py-10">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
