import { listMedia } from "@/lib/media-store";
import MediaLibraryClient from "./MediaLibraryClient";

export const metadata = { title: "Media Library" };
export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const items = await listMedia();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Media Library</h1>
      <p className="text-sm text-steel mb-6 max-w-2xl">
        Uploads are saved to Supabase Storage and persist across sessions and
        deploys — copy a URL from here into a product's image field.
      </p>
      <MediaLibraryClient initialItems={items} />
    </div>
  );
}
