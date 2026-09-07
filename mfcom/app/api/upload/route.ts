import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { uploadMedia } from "@/lib/media-store";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches the stated limit in the admin UI
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

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
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (10MB max)" }, { status: 400 });
  }

  try {
    const record = await uploadMedia(file);
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
