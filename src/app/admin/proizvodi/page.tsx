import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { readAdminCatalog } from "@/lib/catalog";
import { adminCategories } from "@/lib/products";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; k?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const q = (query.q || "").trim().toLowerCase();
  const k = query.k || "sve";
  const products = await readAdminCatalog();

  const list = products.filter((product) => {
    const byCategory = k === "sve" || product.category === k;
    const hay = `${product.name} ${product.fullName} ${product.slug}`.toLowerCase();
    const byQuery = !q || hay.includes(q);
    return byCategory && byQuery;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
            Katalog
          </p>
          <h1 className="mt-2 font-serif text-5xl">Proizvodi</h1>
        </div>
        <Link href="/admin/proizvodi/novi" className="btn-solid">
          Novi proizvod
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" action="/admin/proizvodi">
        <input
          name="q"
          defaultValue={query.q || ""}
          placeholder="Pretraga"
          className="min-w-[220px] flex-1 border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        />
        <select
          name="k"
          defaultValue={k}
          className="border border-ink/10 bg-white px-4 py-3 outline-none focus:border-ink"
        >
          <option value="sve">Sve kategorije</option>
          {adminCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-line">
          Filtriraj
        </button>
      </form>

      <p className="mt-6 text-xs tracking-[0.16em] text-muted uppercase">
        {list.length} komada
      </p>

      <div className="mt-4 overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-paper text-[11px] tracking-[0.16em] text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Proizvod</th>
              <th className="px-4 py-3 font-normal">Kategorija</th>
              <th className="px-4 py-3 font-normal">Cena</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal"> </th>
            </tr>
          </thead>
          <tbody>
            {list.map((product) => (
              <tr key={product.slug} className="border-b border-ink/6 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden bg-paper">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/admin/proizvodi/${product.slug}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      {product.featured ? (
                        <p className="text-[11px] text-muted">Izdvojeno</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">
                  {adminCategories.find((item) => item.id === product.category)?.label ??
                    product.category}
                </td>
                <td className="px-4 py-3 tabular-nums">{product.priceLabel}</td>
                <td className="px-4 py-3">
                  {product.hidden ? "Sakriven" : "Na sajtu"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/proizvodi/${product.slug}`} className="underline">
                    Izmeni
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">Nema proizvoda za ovu pretragu.</p>
        ) : null}
      </div>
    </div>
  );
}
