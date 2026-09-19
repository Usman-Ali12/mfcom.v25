"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, AlertTriangle, CheckCircle2, X, Link2, ImagePlus, ZoomIn } from "lucide-react";
import Select, { type SelectOption } from "@/components/storefront/Select";
import { confirmCatalogImportAction, type ConfirmImportRow } from "./actions";

type ApiCategory = { name: string; slug: string; group: string };

type Row = {
  sourceIndex: string;
  name: string;
  brand: string;
  condition: "new" | "used";
  price: number | null;
  currency: string;
  description: string;
  images: string[];
  enhanced: boolean;
  include: boolean;
  // "" means unmatched / needs a manual pick. A non-empty value is either
  // an existing category slug, or — when isNewCategory is true — the raw
  // name to create.
  categorySlug: string;
  isNewCategory: boolean;
};

const NEW_CATEGORY = "__new__";

export default function ImportClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "uploading" | "reviewing" | "importing" | "done">("idle");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [result, setResult] = useState<{ imported: number; failed: { name: string; error: string }[] } | null>(null);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const [urlEditIndex, setUrlEditIndex] = useState<number | null>(null);
  const [rowUploadingIndex, setRowUploadingIndex] = useState<number | null>(null);
  const rowFileInputRef = useRef<HTMLInputElement>(null);
  const rowFileTargetIndex = useRef<number | null>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/catalog-import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setCategories(data.categories);
      setSkippedCount(data.skippedCount + (data.failedCount || 0));
      setRows(
        data.drafts.map((d: any) => ({
          sourceIndex: d.sourceIndex,
          name: d.name,
          brand: d.brand,
          condition: d.condition,
          price: d.price,
          currency: d.currency,
          description: d.description,
          images: d.imageUrl ? [d.imageUrl] : [],
          enhanced: d.enhanced,
          include: true,
          categorySlug: d.categorySlugGuess || "",
          isNewCategory: false,
        }))
      );
      setStatus("reviewing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong reading that file.");
      setStatus("idle");
    }
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  const MAX_IMAGES = 4;

  // A row's photos are just URLs on the draft — from the internet, from a
  // device upload, or the cleaned-up WhatsApp original. Nothing touches
  // Supabase's product table until Import is clicked; uploading here goes
  // through the same /api/upload every other image in the admin uses.
  // Capped at a few per product, same as the manual product form — not
  // meant to be a full gallery manager for 109 rows at once.
  async function addRowImageFromFile(index: number, file: File) {
    setRowUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setRows((prev) =>
        prev.map((r, i) => (i === index && r.images.length < MAX_IMAGES ? { ...r, images: [...r.images, data.url] } : r))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Couldn't upload that photo");
    } finally {
      setRowUploadingIndex(null);
    }
  }

  function removeRowImage(index: number, url: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, images: r.images.filter((u) => u !== url) } : r)));
  }

  function categoryOptionsFor(row: Row): SelectOption[] {
    return [
      { value: "", label: "— Choose category —" },
      ...categories.map((c) => ({ value: c.slug, label: `${c.name} (${c.group})` })),
      { value: NEW_CATEGORY, label: "+ Create new category…" },
    ];
  }

  const includedCount = rows.filter((r) => r.include).length;
  const missingPriceCount = rows.filter((r) => r.include && (r.price === null || r.price <= 0)).length;
  const missingCategoryCount = rows.filter((r) => r.include && !r.categorySlug).length;

  async function handleImport() {
    // A product with no price isn't a partial success — Rs. 0 is what
    // showed up on the live product page last time this got missed among
    // 100+ rows. Force an explicit decision instead of letting it slip
    // through silently.
    if (missingPriceCount > 0) {
      const ok = window.confirm(
        `${missingPriceCount} product${missingPriceCount === 1 ? "" : "s"} still ${
          missingPriceCount === 1 ? "has" : "have"
        } no price set — ${missingPriceCount === 1 ? "it" : "they"} would go live showing "Rs. 0". Import anyway?`
      );
      if (!ok) return;
    }

    setStatus("importing");
    const payload: ConfirmImportRow[] = rows
      .filter((r) => r.include)
      .map((r) => ({
        name: r.name,
        brand: r.brand,
        categorySlug: r.categorySlug,
        isNewCategory: r.isNewCategory,
        condition: r.condition,
        price: r.price ?? 0,
        currency: r.currency,
        description: r.description,
        images: r.images,
      }));
    const res = await confirmCatalogImportAction(payload);
    setResult(res);
    setStatus("done");
  }

  if (status === "done" && result) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <CheckCircle2 size={40} className="mx-auto mb-4 text-green-700" />
        <h2 className="font-display text-xl font-semibold mb-2">
          Imported {result.imported} product{result.imported === 1 ? "" : "s"}
        </h2>
        {result.failed.length > 0 && (
          <div className="text-left bg-red/5 border border-red/20 chamfer-sm p-4 mt-4 text-sm">
            <p className="font-medium text-red mb-2">{result.failed.length} couldn't be saved:</p>
            <ul className="space-y-1 text-steel">
              {result.failed.map((f, i) => (
                <li key={i}>
                  {f.name}: {f.error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={() => router.push("/admin/products")}
          className="mt-6 h-10 px-5 bg-void text-white text-sm font-medium chamfer-sm"
        >
          Go to products
        </button>
      </div>
    );
  }

  if (status === "idle" || status === "uploading") {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div
          className="border-2 border-dashed border-line chamfer p-10 cursor-pointer hover:border-red transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {status === "uploading" ? (
            <>
              <Loader2 size={32} className="mx-auto mb-3 animate-spin text-red" />
              <p className="text-sm text-steel">Reading catalog and uploading photos…</p>
            </>
          ) : (
            <>
              <Upload size={32} className="mx-auto mb-3 text-steel" />
              <p className="font-medium mb-1">Upload catalog CSV</p>
              <p className="text-sm text-steel">
                The .csv exported by your WhatsApp catalog scraper. Photos are pulled straight
                out of it — no separate image upload needed.
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {error && (
          <p className="text-sm text-red mt-4 flex items-center justify-center gap-1.5">
            <AlertTriangle size={14} /> {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-paper border border-line chamfer-sm p-4 mb-5 text-sm flex flex-wrap gap-x-6 gap-y-1">
        <span>
          <strong>{rows.length}</strong> products found
        </span>
        {skippedCount > 0 && <span className="text-steel">{skippedCount} rows skipped (no name/photo of their own)</span>}
        {missingPriceCount > 0 && (
          <span className="text-red flex items-center gap-1">
            <AlertTriangle size={13} /> {missingPriceCount} missing a price
          </span>
        )}
        {missingCategoryCount > 0 && (
          <span className="text-red flex items-center gap-1">
            <AlertTriangle size={13} /> {missingCategoryCount} missing a category
          </span>
        )}
      </div>

      <div className="overflow-x-auto border border-line chamfer-sm">
        <table className="w-full text-sm">
          <thead className="bg-paper border-b border-line text-left">
            <tr>
              <th className="p-3 w-10"></th>
              <th className="p-3 w-14">Photo</th>
              <th className="p-3 min-w-[180px]">Name</th>
              <th className="p-3 min-w-[120px]">Brand</th>
              <th className="p-3 min-w-[200px]">Category</th>
              <th className="p-3 w-28">Condition</th>
              <th className="p-3 w-28">Price (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.sourceIndex} className={`border-b border-line last:border-0 ${!row.include ? "opacity-40" : ""}`}>
                <td className="p-3 align-top">
                  <input
                    type="checkbox"
                    checked={row.include}
                    onChange={(e) => updateRow(i, { include: e.target.checked })}
                  />
                </td>
                <td className="p-3 align-top">
                  <div className="flex gap-1.5 flex-wrap max-w-[144px]">
                    {row.images.map((url, imgIdx) => (
                      <div key={url} className="relative w-16 h-16 group shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          onClick={() => setZoomUrl(url)}
                          className="w-16 h-16 object-cover chamfer-sm bg-paper cursor-zoom-in border border-line"
                        />
                        {imgIdx === 0 && (
                          <button
                            type="button"
                            onClick={() => setZoomUrl(url)}
                            className="absolute inset-0 flex items-center justify-center bg-void/0 group-hover:bg-void/40 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <ZoomIn size={16} className="text-white" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeRowImage(i, url)}
                          aria-label="Remove photo"
                          className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-void/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                        {rowUploadingIndex === i && imgIdx === row.images.length - 1 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <Loader2 size={16} className="animate-spin text-red" />
                          </div>
                        )}
                      </div>
                    ))}
                    {row.images.length === 0 && (
                      <div className="relative w-16 h-16 shrink-0 bg-paper chamfer-sm border border-dashed border-line">
                        {rowUploadingIndex === i && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-red" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!row.enhanced && row.images.length > 0 && (
                    <p className="text-[10px] text-steel mt-1 leading-tight">not cleaned up</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {row.images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        title={row.images.length === 0 ? "Upload from your device" : "Add another photo"}
                        onClick={() => {
                          rowFileTargetIndex.current = i;
                          rowFileInputRef.current?.click();
                        }}
                        className="text-steel hover:text-red transition-colors"
                      >
                        <ImagePlus size={14} />
                      </button>
                    )}
                    {row.images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        title="Paste an image URL"
                        onClick={() => setUrlEditIndex(urlEditIndex === i ? null : i)}
                        className="text-steel hover:text-red transition-colors"
                      >
                        <Link2 size={14} />
                      </button>
                    )}
                  </div>
                  {urlEditIndex === i && (
                    <input
                      autoFocus
                      placeholder="Paste image URL, Enter to use"
                      className="w-32 h-7 px-1.5 mt-1 border border-line chamfer-sm text-[11px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const url = (e.target as HTMLInputElement).value.trim();
                          if (url && row.images.length < MAX_IMAGES) {
                            setRows((prev) => prev.map((r, ri) => (ri === i ? { ...r, images: [...r.images, url] } : r)));
                          }
                          setUrlEditIndex(null);
                        } else if (e.key === "Escape") {
                          setUrlEditIndex(null);
                        }
                      }}
                    />
                  )}
                </td>
                <td className="p-3 align-top">
                  <input
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    className="w-full h-8 px-2 border border-line chamfer-sm text-sm"
                  />
                </td>
                <td className="p-3 align-top">
                  <input
                    value={row.brand}
                    onChange={(e) => updateRow(i, { brand: e.target.value })}
                    placeholder="—"
                    className="w-full h-8 px-2 border border-line chamfer-sm text-sm"
                  />
                </td>
                <td className="p-3 align-top">
                  <Select
                    value={row.isNewCategory ? NEW_CATEGORY : row.categorySlug}
                    onChange={(v) => {
                      if (v === NEW_CATEGORY) {
                        updateRow(i, { isNewCategory: true, categorySlug: "" });
                      } else {
                        updateRow(i, { isNewCategory: false, categorySlug: v });
                      }
                    }}
                    placeholder="Choose category"
                    options={categoryOptionsFor(row)}
                  />
                  {row.isNewCategory && (
                    <input
                      autoFocus
                      value={row.categorySlug}
                      onChange={(e) => updateRow(i, { categorySlug: e.target.value })}
                      placeholder="New category name"
                      className="w-full h-8 px-2 border border-line chamfer-sm text-sm mt-1.5"
                    />
                  )}
                </td>
                <td className="p-3 align-top">
                  <div className="flex h-8 border border-line chamfer-sm overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => updateRow(i, { condition: "new" })}
                      className={`flex-1 font-medium ${row.condition === "new" ? "bg-void text-white" : "bg-white"}`}
                    >
                      New
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRow(i, { condition: "used" })}
                      className={`flex-1 font-medium border-l border-line ${
                        row.condition === "used" ? "bg-red text-white" : "bg-white"
                      }`}
                    >
                      Used
                    </button>
                  </div>
                </td>
                <td className="p-3 align-top">
                  <input
                    type="number"
                    value={row.price ?? ""}
                    onChange={(e) => updateRow(i, { price: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Set price"
                    className={`w-full h-8 px-2 border chamfer-sm text-sm ${
                      row.price === null || row.price <= 0 ? "border-red" : "border-line"
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-5 sticky bottom-0 bg-white py-3">
        <button
          onClick={() => {
            setStatus("idle");
            setRows([]);
          }}
          className="flex items-center gap-1.5 text-sm text-steel hover:text-void"
        >
          <X size={14} /> Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={includedCount === 0 || status === "importing"}
          className="press h-11 px-6 bg-red text-white text-sm font-medium chamfer disabled:opacity-50 flex items-center gap-2"
        >
          {status === "importing" && <Loader2 size={16} className="animate-spin" />}
          Import {includedCount} product{includedCount === 1 ? "" : "s"}
        </button>
      </div>

      {/* Shared by every row's "upload from device" button, so it's one
          hidden input rather than 100+ of them on the page. */}
      <input
        ref={rowFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const idx = rowFileTargetIndex.current;
          if (file && idx !== null) addRowImageFromFile(idx, file);
          e.target.value = "";
        }}
      />

      {zoomUrl && (
        <div
          className="fixed inset-0 z-[100] bg-void/90 flex items-center justify-center p-8 cursor-zoom-out"
          onClick={() => setZoomUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomUrl} alt="" className="max-w-full max-h-full object-contain bg-white" />
          <button
            onClick={() => setZoomUrl(null)}
            className="absolute top-5 right-5 text-white hover:text-red"
            aria-label="Close preview"
          >
            <X size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
