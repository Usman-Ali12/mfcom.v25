"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import Select from "@/components/storefront/Select";
import type { Product } from "@/lib/mock-data";
import type { MediaItem } from "@/lib/media-store";

// Sentinel used for the "+ New brand…" / "+ New category…" options below.
// The server action (products/actions.ts) checks for this exact value and,
// if present, creates the brand/category from the accompanying
// newBrandName/newCategoryName field before saving the product — so adding
// either one never requires leaving this form.
const NEW_VALUE = "__new__";

export default function ProductForm({
  action,
  initial,
  submitLabel,
  categoryNames,
  brandNames,
  mediaItems,
}: {
  action: (formData: FormData) => void;
  initial?: Product;
  submitLabel: string;
  categoryNames: string[];
  brandNames: string[];
  mediaItems: MediaItem[];
}) {
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    initial?.specifications?.length ? initial.specifications : [{ label: "", value: "" }]
  );
  const [imageUrl, setImageUrl] = useState(initial?.image || "");
  const [pickerOpen, setPickerOpen] = useState(false);
  // Local, additive copy of mediaItems — newly uploaded images get pushed
  // in here immediately so they show up in the picker without a full page
  // reload, same as MediaLibraryClient does on its own page.
  const [library, setLibrary] = useState<MediaItem[]>(mediaItems);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brand, setBrand] = useState(initial?.brand || "");
  const [newBrandName, setNewBrandName] = useState("");
  const [category, setCategory] = useState(initial?.category || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [badge, setBadge] = useState(initial?.badge || "");
  const [stock, setStock] = useState(initial?.stock || "in-stock");
  const [name, setName] = useState(initial?.name || "");
  const [shortSpec, setShortSpec] = useState(initial?.shortSpec || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [autoFilled, setAutoFilled] = useState(false);

  // Generates a description + short spec line from whatever's already
  // filled in — name, brand, category, and any specification rows. Not a
  // live AI call (that would mean asking for a separate API key on top of
  // Supabase, which has already been a friction point), just a solid
  // template so a real, readable description exists without hand-writing
  // one for every single product. Always editable afterward — nothing is
  // locked once generated.
  function generateCopy() {
    // Fall back to the typed new-brand/new-category name when the sentinel
    // is selected, so auto-fill never literally inserts "__new__".
    const brandLabel = brand === NEW_VALUE ? newBrandName : brand;
    const categoryLabel = category === NEW_VALUE ? newCategoryName : category;

    const specLine = specs
      .filter((s) => s.label && s.value)
      .map((s) => s.value)
      .slice(0, 3)
      .join(" · ");

    if (specLine && !shortSpec) setShortSpec(specLine);

    const parts: string[] = [];
    if (name) {
      parts.push(
        brandLabel ? `The ${name} from ${brandLabel}` : `The ${name}`
      );
    }
    if (categoryLabel) {
      parts.push(`is built for ${categoryLabel.toLowerCase()} use`);
    }
    let opening = parts.join(" ") || "This product";
    if (!opening.endsWith(".")) opening += ".";

    const specSentence = specLine
      ? ` Key specs: ${specLine}.`
      : "";

    const closing = brandLabel
      ? ` Backed by ${brandLabel}'s manufacturer warranty and genuine stock at MF COM.`
      : " In stock and ready to ship from MF COM.";

    setDescription(`${opening}${specSentence}${closing}`);
    setAutoFilled(true);
  }

  function addSpec() {
    setSpecs((s) => [...s, { label: "", value: "" }]);
  }
  function removeSpec(i: number) {
    setSpecs((s) => s.filter((_, idx) => idx !== i));
  }
  function updateSpec(i: number, field: "label" | "value", val: string) {
    setSpecs((s) => s.map((spec, idx) => (idx === i ? { ...spec, [field]: val } : spec)));
  }

  // Uploads straight from the product form — same /api/upload endpoint
  // MediaLibraryClient uses. Previously this form could only pick from
  // already-uploaded images or a pasted URL; if nothing was uploaded yet,
  // there was no way to add one without leaving to /admin/media first.
  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Upload failed (${res.status})`);
        }
        const record: MediaItem = await res.json();
        setLibrary((prev) => [record, ...prev]);
        setImageUrl(record.url);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="max-w-3xl space-y-8">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {/* Basic info */}
      <section className="bg-white border border-line chamfer p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="mono-label text-[11px] text-red">Basic information</p>
          <button
            type="button"
            onClick={generateCopy}
            disabled={!name}
            className="text-xs text-red font-medium hover:underline disabled:text-steel disabled:no-underline disabled:cursor-not-allowed"
          >
            ✨ Auto-fill description
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium block mb-1.5">Product name *</label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">SKU</label>
            <input
              name="sku"
              defaultValue={initial?.sku}
              placeholder="auto-generated if blank"
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Brand *</label>
            <input type="hidden" name="brand" value={brand} required={brand !== NEW_VALUE} />
            <Select
              value={brand}
              onChange={setBrand}
              placeholder="Select brand"
              options={[
                ...brandNames.map((b) => ({ value: b, label: b })),
                { value: NEW_VALUE, label: "+ Add new brand…" },
              ]}
            />
            {brand === NEW_VALUE && (
              <input
                name="newBrandName"
                required
                autoFocus
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="New brand name, e.g. Cooler Master"
                className="w-full h-10 px-3 mt-2 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
            )}
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Category *</label>
            <input type="hidden" name="category" value={category} required={category !== NEW_VALUE} />
            <Select
              value={category}
              onChange={setCategory}
              placeholder="Select category"
              options={[
                ...categoryNames.map((c) => ({ value: c, label: c })),
                { value: NEW_VALUE, label: "+ Add new category…" },
              ]}
            />
            {category === NEW_VALUE && (
              <>
                <input
                  name="newCategoryName"
                  required
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name, e.g. Webcams"
                  className="w-full h-10 px-3 mt-2 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
                />
                <p className="text-xs text-steel mt-1.5">
                  Added under "Other" — regroup it anytime from the Categories page.
                </p>
              </>
            )}
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Badge</label>
            <input type="hidden" name="badge" value={badge} />
            <Select
              value={badge}
              onChange={setBadge}
              placeholder="None"
              options={[
                { value: "", label: "None" },
                { value: "New", label: "New" },
                { value: "Best Seller", label: "Best Seller" },
                { value: "Deal", label: "Deal" },
              ]}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium block mb-1.5">Short spec line</label>
            <input
              name="shortSpec"
              value={shortSpec}
              onChange={(e) => setShortSpec(e.target.value)}
              placeholder="e.g. 12GB GDDR6X · Triple fan · OC edition"
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium">Description *</label>
              {autoFilled && (
                <span className="text-[11px] text-steel">Auto-filled — edit freely</span>
              )}
            </div>
            <textarea
              name="description"
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setAutoFilled(false);
              }}
              className="w-full px-3 py-2 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
            />
            <p className="text-xs text-steel mt-1.5">
              This also becomes the page's SEO meta description automatically —
              no separate SEO field to fill in.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing & stock */}
      <section className="bg-white border border-line chamfer p-6">
        <p className="mono-label text-[11px] text-red mb-4">Pricing &amp; stock</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5">Price (PKR) *</label>
            <input
              name="price"
              type="number"
              required
              min={0}
              defaultValue={initial?.price}
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Previous price</label>
            <input
              name="previousPrice"
              type="number"
              min={0}
              defaultValue={initial?.previousPrice}
              placeholder="leave blank if no discount"
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Stock quantity *</label>
            <input
              name="stockCount"
              type="number"
              required
              min={0}
              defaultValue={initial?.stockCount}
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Stock state *</label>
            <input type="hidden" name="stock" value={stock} required />
            <Select
              value={stock}
              onChange={(v) => setStock(v as Product["stock"])}
              options={[
                { value: "in-stock", label: "In stock" },
                { value: "low-stock", label: "Low stock" },
                { value: "out-of-stock", label: "Out of stock" },
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5">Warranty</label>
            <input
              name="warranty"
              defaultValue={initial?.warranty}
              placeholder="e.g. 2-year manufacturer warranty"
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
            />
          </div>
        </div>
      </section>

      {/* Image */}
      <section className="bg-white border border-line chamfer p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="mono-label text-[11px] text-red">Image</p>
          {library.length > 0 && (
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="text-xs text-red font-medium hover:underline"
            >
              {pickerOpen ? "Close" : "Choose from Media Library"}
            </button>
          )}
        </div>

        {/* Upload directly from here — drag & drop or click. Previously the
            only way to add a brand-new image was to leave this form, go to
            /admin/media, upload there, then come back and pick it. */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-3 flex items-center justify-center gap-2.5 h-16 chamfer-sm border-2 border-dashed cursor-pointer transition-colors ${
            dragging ? "border-red bg-red/5" : "border-line bg-paper hover:border-void/30"
          }`}
        >
          {uploading ? (
            <Loader2 size={17} className="text-red animate-spin" />
          ) : (
            <Upload size={17} className={dragging ? "text-red" : "text-steel"} />
          )}
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : "Drop an image here, or click to upload"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>
        {uploadError && <p className="text-xs text-red mb-3">{uploadError}</p>}

        {pickerOpen && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4 max-h-48 overflow-y-auto thin-scroll border border-line chamfer-sm p-2">
            {library.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setImageUrl(item.url);
                  setPickerOpen(false);
                }}
                className="aspect-square chamfer-sm overflow-hidden border-2 border-transparent hover:border-red transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-4 items-start">
          {imageUrl && (
            <div className="w-20 h-20 shrink-0 chamfer-sm overflow-hidden bg-paper border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.2")} />
            </div>
          )}
          <div className="flex-1">
            <label className="text-xs font-medium block mb-1.5">Image URL</label>
            <input
              name="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Upload above, or paste any image URL directly"
              className="w-full h-10 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
            />
            <p className="text-xs text-steel mt-2">
              {library.length > 0
                ? "Upload a new image, pick one already uploaded above, or paste any image URL."
                : "Upload an image above, or paste any image URL directly."}
            </p>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-white border border-line chamfer p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="mono-label text-[11px] text-red">Specifications</p>
          <button
            type="button"
            onClick={addSpec}
            className="flex items-center gap-1 text-xs text-red font-medium hover:gap-1.5 transition-all"
          >
            <Plus size={13} /> Add row
          </button>
        </div>
        <div className="space-y-3 sm:space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 pb-3 sm:pb-0 border-b sm:border-b-0 border-line last:border-0 last:pb-0">
              <input
                name="specLabel"
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                placeholder="Label (e.g. Processor)"
                className="w-full sm:flex-1 h-9 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
              />
              <div className="flex gap-2 sm:flex-1">
                <input
                  name="specValue"
                  value={spec.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)}
                  placeholder="Value (e.g. Ryzen 7 7745HX)"
                  className="flex-1 h-9 px-3 border border-line chamfer-sm text-sm outline-none focus:ring-1 focus:ring-red"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(i)}
                  className="w-9 h-9 flex items-center justify-center text-steel hover:text-red transition-colors shrink-0"
                  aria-label="Remove row"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          className="h-11 px-6 bg-red text-white text-sm font-medium chamfer hover:bg-red-dim transition-colors"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/products"
          className="h-11 px-6 flex items-center border border-line chamfer text-sm font-medium hover:bg-paper transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
