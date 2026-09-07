import { listBrands } from "@/lib/brands-store";
import BrandRow from "./BrandRow";
import BrandCardMobile from "./BrandCardMobile";
import AddBrandForm from "./AddBrandForm";

export const metadata = { title: "Brands" };
export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await listBrands();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Brands</h1>
      <p className="text-sm text-steel mb-6 max-w-2xl">
        These populate the Brand dropdown on every product. You can also add a
        new brand inline while creating or editing a product — no need to
        come back here first.
      </p>

      {/* Mobile: stacked cards, same convention as products/orders/promotions */}
      <div className="sm:hidden space-y-3 mb-8">
        {brands.map((b) => (
          <BrandCardMobile key={b.id} brand={b} />
        ))}
      </div>

      <div className="hidden sm:block bg-white border border-line chamfer overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="text-left text-steel bg-paper border-b border-line">
              <th className="p-3 font-normal">Name</th>
              <th className="p-3 font-normal">Slug</th>
              <th className="p-3 font-normal w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <BrandRow key={b.id} brand={b} />
            ))}
          </tbody>
        </table>
      </div>

      <section className="bg-white border border-line chamfer p-6 max-w-lg">
        <p className="mono-label text-[11px] text-red mb-4">Add brand</p>
        <AddBrandForm />
      </section>
    </div>
  );
}
