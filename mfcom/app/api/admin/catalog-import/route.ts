import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { uploadMedia } from "@/lib/media-store";
import { parseWhatsAppCatalogCsv, dataUrlToFile } from "@/lib/catalog-import";
import { listCategories } from "@/lib/categories-store";
import { listBrands } from "@/lib/brands-store";

const MAX_CSV_SIZE = 15 * 1024 * 1024; // the real scraper export ran ~2MB; 15MB covers a much bigger catalog

// The images live in the CSV as base64 right now. Uploading them to
// Supabase Storage here (rather than on final "Import" confirm) means the
// preview screen and the confirm step both just pass around a small hosted
// URL instead of shuttling megabytes of base64 back and forth between
// client and server on every edit. Trade-off: images land in Storage even
// for rows the admin unchecks before confirming — acceptable for an
// internal admin tool; unused ones can be cleared from the media library.
export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Please upload a .csv file" }, { status: 400 });
  }
  if (file.size > MAX_CSV_SIZE) {
    return NextResponse.json({ error: "CSV too large (15MB max)" }, { status: 400 });
  }

  const csvText = await file.text();
  const { drafts, skippedCount } = parseWhatsAppCatalogCsv(csvText);

  if (drafts.length === 0) {
    return NextResponse.json(
      { error: "No products with both a name and a photo were found in that file." },
      { status: 400 }
    );
  }

  const results = await Promise.allSettled(
    drafts.map(async (d) => {
      let imageUrl = "";
      if (d.imageDataUrl) {
        try {
          const imgFile = dataUrlToFile(d.imageDataUrl, `catalog-${d.sourceIndex}.jpg`);
          const media = await uploadMedia(imgFile);
          imageUrl = media.url;
        } catch {
          imageUrl = d.imageUrlFallback || "";
        }
      } else {
        imageUrl = d.imageUrlFallback || "";
      }
      return {
        sourceIndex: d.sourceIndex,
        name: d.name,
        brand: d.brand,
        categorySlugGuess: d.categorySlugGuess,
        condition: d.condition,
        price: d.price,
        currency: d.currency,
        description: d.description,
        imageUrl,
        include: true,
      };
    })
  );

  const uploaded = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .map((r) => r.value);
  const failedCount = results.length - uploaded.length;

  const [categories, brands] = await Promise.all([listCategories(), listBrands()]);

  return NextResponse.json({
    drafts: uploaded,
    skippedCount,
    failedCount,
    categories: categories.map((c) => ({ name: c.name, slug: c.slug, group: c.group })),
    brands: brands.map((b) => b.name),
  });
}
