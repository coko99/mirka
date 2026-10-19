"use client";

import { useFormStatus } from "react-dom";
import { adminCategories, type RawProduct } from "@/lib/products";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-solid" disabled={pending}>
      {pending ? "Čuvam…" : label}
    </button>
  );
}

export function ProductForm({
  product,
  action,
}: {
  product?: RawProduct;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="mt-8 max-w-2xl space-y-4">
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}

      <label className="block text-sm">
        Naziv
        <input
          required
          name="name"
          defaultValue={product?.name ?? ""}
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
      </label>

      <label className="block text-sm">
        Pun naziv
        <textarea
          name="fullName"
          rows={3}
          defaultValue={product?.fullName ?? ""}
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          Cena (RSD)
          <input
            required
            name="price"
            defaultValue={product?.price ?? ""}
            placeholder="4500"
            className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          Kategorija
          <select
            name="category"
            defaultValue={product?.category ?? "ostalo"}
            className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
          >
            {adminCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        Fotografija {product ? "(ostavite prazno da zadržite postojeću)" : ""}
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!product}
          className="mt-1 w-full border border-ink/10 bg-white px-4 py-3 text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1 file:text-cream"
        />
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={Boolean(product?.featured)}
        />
        Izdvojeno na početnoj
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="hidden" defaultChecked={Boolean(product?.hidden)} />
        Sakrij sa sajta
      </label>

      <Submit label={product ? "Sačuvaj izmene" : "Dodaj proizvod"} />
    </form>
  );
}
