import { notFound } from "next/navigation";
import { getProductById } from "@/lib/admin-store";
import { listCategories } from "@/lib/categories-store";
import { listBrands } from "@/lib/brands-store";
import { listMedia } from "@/lib/media-store";
import { updateProductAction } from "../../actions";
import ProductForm from "../../ProductForm";

export const metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();
  const [categoryNames, brandNames, mediaItems] = await Promise.all([
    listCategories().then((c) => c.map((x) => x.name)),
    listBrands().then((b) => b.map((x) => x.name)),
    listMedia(),
  ]);
  // A product's existing brand/category might predate the brands table or
  // have been removed since — keep it selectable in its own edit form even
  // if it's since fallen out of the shared list, rather than silently
  // blanking the field.
  if (product.brand && !brandNames.includes(product.brand)) brandNames.unshift(product.brand);
  if (product.category && !categoryNames.includes(product.category)) categoryNames.unshift(product.category);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Edit product</h1>
      <p className="text-sm text-steel mb-8">{product.name}</p>
      <ProductForm
        action={updateProductAction}
        initial={product}
        submitLabel="Save changes"
        categoryNames={categoryNames}
        brandNames={brandNames}
        mediaItems={mediaItems}
      />
    </div>
  );
}
