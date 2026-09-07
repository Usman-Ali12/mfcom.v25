import { listCategories } from "@/lib/categories-store";
import CategoryRow from "./CategoryRow";
import CategoryCardMobile from "./CategoryCardMobile";
import AddCategoryForm from "./AddCategoryForm";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  const groups = Array.from(new Set(categories.map((c) => c.group)));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Categories</h1>
      <p className="text-sm text-steel mb-6 max-w-2xl">
        These drive the mega menu, footer, homepage category rail, and every
        product's category field — rename or regroup one here and it updates
        everywhere at once.
      </p>

      {/* Mobile: stacked cards, same convention as products/orders/promotions */}
      <div className="sm:hidden space-y-3 mb-8">
        {categories.map((c) => (
          <CategoryCardMobile key={c.id} category={c} groups={groups} />
        ))}
      </div>

      <div className="hidden sm:block bg-white border border-line chamfer overflow-x-auto mb-8">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-steel bg-paper border-b border-line">
              <th className="p-3 font-normal">Name &amp; group</th>
              <th className="p-3 font-normal">Slug</th>
              <th className="p-3 font-normal w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} groups={groups} />
            ))}
          </tbody>
        </table>
      </div>

      <section className="bg-white border border-line chamfer p-6 max-w-lg">
        <p className="mono-label text-[11px] text-red mb-4">Add category</p>
        <AddCategoryForm groups={groups} />
      </section>
    </div>
  );
}
