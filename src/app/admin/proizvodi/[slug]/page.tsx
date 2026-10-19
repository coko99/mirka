import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateAdminProduct } from "@/app/admin/actions";
import { DeleteProductButton } from "@/app/admin/proizvodi/DeleteProductButton";
import { ProductForm } from "@/app/admin/proizvodi/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readRawCatalog } from "@/lib/catalog";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const catalog = await readRawCatalog();
  const product = catalog.find((item) => item.slug === slug);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/proizvodi" className="text-xs underline">
        ← Svi proizvodi
      </Link>
      <div className="mt-6 flex flex-wrap items-start gap-8">
        <div className="relative size-28 overflow-hidden bg-paper">
          <Image
            src={product.image}
            alt=""
            fill
            className="object-contain p-2"
            sizes="112px"
          />
        </div>
        <div>
          <h1 className="font-serif text-5xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">{product.priceLabel}</p>
        </div>
      </div>
      <ProductForm product={product} action={updateAdminProduct} />
      <DeleteProductButton slug={product.slug} />
    </div>
  );
}
