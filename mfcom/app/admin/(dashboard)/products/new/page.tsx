import ProductForm from "../ProductForm";
import { createProductAction } from "../actions";
import { listCategories } from "@/lib/categories-store";
import { listBrands } from "@/lib/brands-store";
import { listMedia } from "@/lib/media-store";

export const metadata = { title: "New Product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categoryNames, brandNames, mediaItems] = await Promise.all([
    listCategories().then((c) => c.map((x) => x.name)),
    listBrands().then((b) => b.map((x) => x.name)),
    listMedia(),
  ]);
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Add product</h1>
      <p className="text-sm text-steel mb-8">Create a new product listing.</p>
      <ProductForm
        action={createProductAction}
        submitLabel="Create product"
        categoryNames={categoryNames}
        brandNames={brandNames}
        mediaItems={mediaItems}
      />
    </div>
  );
}
