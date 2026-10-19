import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { LoginForm } from "@/app/admin/login/LoginForm";

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect("/admin");

  return (
    <main className="grid min-h-full place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-paper p-8 shadow-[0_24px_60px_-32px_rgba(20,17,16,0.5)] md:p-10">
        <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
          MIRKA with love
        </p>
        <h1 className="mt-3 font-serif text-5xl">Admin</h1>
        <p className="mt-3 text-sm text-ink/65">
          Samo za atelje. Unesite admin lozinku.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
