"use server";

import { revalidatePath } from "next/cache";
import { removeMedia } from "@/lib/media-store";

export async function deleteMediaAction(id: string) {
  await removeMedia(id);
  revalidatePath("/admin/media");
}
