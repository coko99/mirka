import Link from "next/link";
import { createAdminProduct } from "@/app/admin/actions";
import { ProductForm } from "@/app/admin/proizvodi/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div>
      <Link href="/admin/proizvodi" className="text-xs underline">
        ← Svi proizvodi
      </Link>
      <h1 className="mt-4 font-serif text-5xl">Novi proizvod</h1>
      <p className="mt-3 max-w-xl text-sm text-ink/65">
        Pojaviće se u kolekciji čim ga sačuvate, osim ako ga sakrijete.
      </p>
      <ProductForm action={createAdminProduct} />
    </div>
  );
}
