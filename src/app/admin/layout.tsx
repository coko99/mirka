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
    <div className="min-h-full bg-[#efe8df] text-ink">
      {authed ? (
        <div className="md:grid md:min-h-dvh md:grid-cols-[240px_1fr]">
          <AdminNav />
          <div className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
