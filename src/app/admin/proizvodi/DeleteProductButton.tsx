"use client";

import { deleteAdminProduct } from "@/app/admin/actions";

export function DeleteProductButton({ slug }: { slug: string }) {
  return (
    <form
      action={deleteAdminProduct}
      onSubmit={(event) => {
        if (!window.confirm("Obrisati ovaj proizvod sa sajta?")) {
          event.preventDefault();
        }
      }}
      className="mt-10"
    >
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="text-xs text-rose underline">
        Obriši proizvod
      </button>
    </form>
  );
}
