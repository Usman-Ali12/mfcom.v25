// Client-only (uses the browser Canvas API — no "server-only" here on
// purpose). Takes the transparent-background PNG that comes back from the
// background-removal API and pads it onto a plain white square, the way an
// actual product-listing photo looks — centered, with breathing room, not
// a cutout floating on a checkerboard or clipped to its own bounding box.
//
// This runs in the browser rather than adding an image-processing
// dependency (sharp etc.) server-side — no new native dependency, and the
// admin sees the result immediately before it uploads.
export async function padCutoutOntoWhiteSquare(pngBlob: Blob, size = 1400): Promise<Blob> {
  const bitmap = await createImageBitmap(pngBlob);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Fit the cutout inside ~80% of the square, centered, preserving aspect
  // ratio — leaves a consistent margin so it reads as a "listing photo"
  // rather than a full-bleed sticker.
  const padding = 0.8;
  const scale = Math.min((size * padding) / bitmap.width, (size * padding) / bitmap.height);
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  const x = (size - drawWidth) / 2;
  const y = (size - drawHeight) / 2;

  ctx.drawImage(bitmap, x, y, drawWidth, drawHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))), "image/jpeg", 0.95);
  });
}
