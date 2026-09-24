import "server-only";
import { createServerSupabaseClient } from "./supabase/server";

// -----------------------------------------------------------------------------
// WhatsApp catalog importer — turns a CSV exported by a WhatsApp-catalog
// scraper into draft products ready for review in the admin UI.
//
// The scraper's CSV shape (observed from the real export used to build this):
//   index, name, price, price_value, currency, description, product_link,
//   image_url, image_data, raw_text
// - Row 1 is the business's own profile card, not a product — skipped.
// - Most rows are extra photos for a product with no name/price of their
//   own (the scraper emits one row per image) — skipped, since without a
//   name there's nothing to import; the product's own row already carries
//   its main photo.
// - image_data is a base64 data: URL of the actual WhatsApp catalog photo —
//   real photos of what's actually being sold, not stock photography.
//
// No CSV library dependency on purpose: the format is simple enough that a
// small RFC4180-style parser (quoted fields, embedded commas/newlines,
// doubled-quote escaping) covers it without adding a package the client
// would need to `npm install` after merging this.
// -----------------------------------------------------------------------------

function parseCsv(text: string): string[][] {
  // Strip a UTF-8 BOM if present (common from Excel/scraper exports).
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // swallow — \r\n line endings are handled by the \n branch
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ""));
}

export type CatalogDraftRow = {
  sourceIndex: string;
  name: string;
  brand: string;
  categorySlugGuess: string;
  condition: "new" | "used";
  price: number | null;
  currency: string;
  description: string;
  imageDataUrl: string | null;
  imageUrlFallback: string;
};

type CategoryRule = { keywords: string[]; slug: string };

// Matched against existing category slugs from supabase/migrations/0002_categories.sql.
// "networking" isn't seeded there — routers/modems/adapters have no natural
// home in a catalog built around gaming peripherals, so the import screen
// offers "+ create new category" for it same as the manual product form does.
const CATEGORY_RULES: CategoryRule[] = [
  { keywords: ["router", "fiber device", "modem"], slug: "networking" },
  { keywords: ["wifi", "wi-fi", "wireless adapter"], slug: "networking" },
  { keywords: ["android box", "tv box"], slug: "networking" },
  { keywords: ["mouse"], slug: "mice" },
  { keywords: ["keyboard", "kb-216", "kb216"], slug: "keyboards" },
  { keywords: ["headset", "headphone", "earphone", "calling"], slug: "headphones" },
  { keywords: ["speaker"], slug: "speakers" },
  { keywords: ["microphone", "mic "], slug: "microphones" },
  { keywords: ["docking station", "dock"], slug: "docking-stations" },
  { keywords: ["hardisk", "hard disk", "hdd", "portable drive"], slug: "hdd" },
  { keywords: ["ssd"], slug: "ssd" },
  { keywords: ["ram", "memory module"], slug: "ram" },
  { keywords: ["graphics card", "gpu"], slug: "graphics-cards" },
  { keywords: ["processor", "cpu"], slug: "processors" },
  { keywords: ["gaming laptop"], slug: "gaming-laptops" },
  { keywords: ["laptop"], slug: "laptops" },
  { keywords: ["desktop pc", "desktop computer"], slug: "desktop-pcs" },
  { keywords: ["laptop stand"], slug: "laptop-stands" },
  { keywords: ["cooling pad"], slug: "cooling-pads" },
  { keywords: ["usb hub"], slug: "usb-hubs" },
  { keywords: ["charger", "power bank", "power adapter"], slug: "chargers" },
  { keywords: ["cable", "connector", "power code"], slug: "cables" },
];

function guessCategorySlug(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) return rule.slug;
  }
  return "";
}

function guessCondition(name: string, description: string): "new" | "used" {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes("used") || text.includes("2nd hand") || text.includes("second hand") || text.includes("open box")) {
    return "used";
  }
  return "new";
}

const KNOWN_BRANDS = [
  "Dell", "HP", "Lenovo", "Logitech", "Apple", "AJAZZ", "TP-Link", "Seagate",
  "WD", "Western Digital", "Razer", "HyperX", "Asus", "Acer", "Samsung", "MSI",
];

function guessBrand(name: string, description: string): string {
  const text = `${name} ${description}`;
  for (const brand of KNOWN_BRANDS) {
    if (text.toLowerCase().includes(brand.toLowerCase())) return brand;
  }
  return "";
}

export function parseWhatsAppCatalogCsv(csvText: string): { drafts: CatalogDraftRow[]; skippedCount: number } {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { drafts: [], skippedCount: 0 };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (key: string) => header.indexOf(key);

  const idxIndex = col("index");
  const idxName = col("name");
  const idxPriceValue = col("price_value");
  const idxCurrency = col("currency");
  const idxDescription = col("description");
  const idxImageUrl = col("image_url");
  const idxImageData = col("image_data");

  const drafts: CatalogDraftRow[] = [];
  let skippedCount = 0;

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const get = (i: number) => (i >= 0 && i < cells.length ? cells[i].trim() : "");

    const sourceIndex = get(idxIndex) || String(r);
    const name = get(idxName);
    const description = get(idxDescription);

    // Row 1 of the real export is the store's own profile card ("Mf Com …"),
    // not a product — it has a name/description like any other row, so a
    // plain empty-name check wouldn't catch it. The scraper always puts it
    // at index 1; every real catalog item starts numbering after it.
    if (sourceIndex === "1") {
      skippedCount++;
      continue;
    }
    if (!name || name.trim().length === 0) {
      skippedCount++;
      continue;
    }

    const priceRaw = get(idxPriceValue);
    const price = priceRaw ? Number(priceRaw.replace(/[^0-9.]/g, "")) : null;

    const imageData = get(idxImageData);
    const imageDataUrl = imageData.startsWith("data:image") ? imageData : null;

    drafts.push({
      sourceIndex,
      name,
      brand: guessBrand(name, description),
      categorySlugGuess: guessCategorySlug(name, description),
      condition: guessCondition(name, description),
      price: price && !Number.isNaN(price) ? price : null,
      currency: get(idxCurrency) || "PKR",
      description,
      imageDataUrl,
      imageUrlFallback: get(idxImageUrl),
    });
  }

  return { drafts, skippedCount };
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bytes = Buffer.from(base64, "base64");
  return new File([bytes], filename, { type: mime });
}

// -----------------------------------------------------------------------------
// Photo cleanup for imported catalog images.
//
// Two layers, tried in order:
// 1. Real background removal (remove.bg, bg_color=ffffff so it composites
//    straight onto solid white server-side) — actually replaces whatever
//    the photo was shot against (a black desk, a patterned bedsheet,
//    whatever) with a genuine white background. This is what makes a grid
//    of WhatsApp photos look like one catalog instead of a pile of
//    random snapshots.
// 2. wsrv.nl pad/sharpen (no API key, no quota) as a fallback — this
//    doesn't remove an existing background, it can only pad letterbox
//    margins white, but it's better than nothing when remove.bg is
//    unavailable or its free monthly quota (50 images) runs out mid-import
//    on a catalog this size.
// Falls back to the untouched original only if both fail — authenticity
// is never lost, only the polish is best-effort.
//
// wsrv.nl needs a fetchable https URL, not raw bytes, so this still stashes
// the raw decoded photo in Storage just long enough to hand its URL over,
// then deletes the temp copy — only the final cleaned photo becomes a
// permanent media library entry.
// -----------------------------------------------------------------------------

async function removeBgWhite(imgFile: File): Promise<File | null> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) return null;

  const form = new FormData();
  form.append("image_file", imgFile);
  form.append("size", "auto");
  form.append("bg_color", "FFFFFF");
  form.append("format", "jpg");

  try {
    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
    });
    if (!res.ok) return null; // quota used up, or a transient failure — fall through to wsrv.nl
    const bytes = await res.arrayBuffer();
    const cleanName = imgFile.name.replace(/\.[^.]+$/, "") + "-clean.jpg";
    return new File([bytes], cleanName, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

function wsrvEnhanceUrl(publicUrl: string): string {
  const params = new URLSearchParams({
    url: publicUrl,
    w: "1400",
    h: "1400",
    fit: "contain",
    bg: "white",
    a: "attention", // smart-crop toward the actual subject when padding
    output: "jpg",
    q: "94",
    sharp: "1",
  });
  return `https://wsrv.nl/?${params.toString()}`;
}

async function wsrvPad(imgFile: File): Promise<File | null> {
  const supabase = createServerSupabaseClient();
  const BUCKET = "media";
  const tempPath = `tmp/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${imgFile.name}`;

  try {
    const bytes = await imgFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(tempPath, bytes, { contentType: imgFile.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(tempPath);
    const enhanceRes = await fetch(wsrvEnhanceUrl(publicUrlData.publicUrl));
    if (!enhanceRes.ok) throw new Error(`wsrv.nl returned ${enhanceRes.status}`);
    const enhancedBytes = await enhanceRes.arrayBuffer();

    supabase.storage.from(BUCKET).remove([tempPath]).catch(() => {});

    const cleanName = imgFile.name.replace(/\.[^.]+$/, "") + "-padded.jpg";
    return new File([enhancedBytes], cleanName, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

export async function enhanceCatalogPhoto(
  imgFile: File
): Promise<{ file: File; enhanced: boolean; bgRemoved: boolean }> {
  const bgRemoved = await removeBgWhite(imgFile);
  if (bgRemoved) return { file: bgRemoved, enhanced: true, bgRemoved: true };

  const padded = await wsrvPad(imgFile);
  if (padded) return { file: padded, enhanced: true, bgRemoved: false };

  return { file: imgFile, enhanced: false, bgRemoved: false };
}

// Re-cleans a photo that's already live on a product — for stragglers like
// a photo imported before this white-background pipeline existed, or one
// remove.bg's monthly quota skipped over the first time. Passes the
// existing URL straight to remove.bg (image_url) rather than re-uploading
// bytes, since it's already hosted; falls back to running it through
// wsrv.nl's padding step (also URL-based) if remove.bg can't do it.
export async function cleanupExistingImageUrl(
  imageUrl: string
): Promise<{ url: string; bgRemoved: boolean } | null> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, size: "auto", bg_color: "FFFFFF", format: "jpg" }),
      });
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        const file = new File([bytes], `cleaned-${Date.now()}.jpg`, { type: "image/jpeg" });
        const { uploadMedia } = await import("./media-store");
        const media = await uploadMedia(file);
        return { url: media.url, bgRemoved: true };
      }
    } catch {
      // fall through to wsrv.nl
    }
  }

  try {
    const enhanceRes = await fetch(wsrvEnhanceUrl(imageUrl));
    if (!enhanceRes.ok) return null;
    const bytes = await enhanceRes.arrayBuffer();
    const file = new File([bytes], `padded-${Date.now()}.jpg`, { type: "image/jpeg" });
    const { uploadMedia } = await import("./media-store");
    const media = await uploadMedia(file);
    return { url: media.url, bgRemoved: false };
  } catch {
    return null;
  }
}
