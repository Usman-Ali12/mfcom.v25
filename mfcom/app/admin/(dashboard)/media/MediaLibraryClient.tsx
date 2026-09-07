"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Upload, Trash2, Copy, Check, ImageIcon, Loader2 } from "lucide-react";
import type { MediaItem } from "@/lib/media-store";
import { deleteMediaAction } from "./actions";

export default function MediaLibraryClient({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const uploadFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
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
        setItems((prev) => [record, ...prev]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  }

  function copyUrl(item: MediaItem) {
    const fullUrl = `${window.location.origin}${item.url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1200);
    });
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => {
      deleteMediaAction(id);
    });
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mb-4 flex flex-col items-center justify-center gap-3 h-48 chamfer border-2 border-dashed cursor-pointer transition-colors ${
          dragging ? "border-red bg-red/5" : "border-line bg-white hover:border-void/30"
        }`}
      >
        {uploading ? (
          <Loader2 size={24} className="text-red animate-spin" />
        ) : (
          <Upload size={24} className={dragging ? "text-red" : "text-steel"} />
        )}
        <p className="text-sm font-medium">
          {uploading ? "Uploading…" : "Drop images here, or click to browse"}
        </p>
        <p className="text-xs text-steel">PNG, JPG, WEBP, GIF up to 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mb-4 text-sm text-red bg-red/10 px-3 py-2 chamfer-sm">{error}</p>
      )}

      {items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-line chamfer">
          <ImageIcon size={28} className="mx-auto mb-3 text-steel" />
          <p className="text-sm text-steel">No images uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative bg-white border border-line chamfer overflow-hidden">
              <div className="aspect-square bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs truncate">{item.filename}</p>
                <p className="text-[10px] text-steel">{(item.size / 1024).toFixed(0)} KB</p>
              </div>
              {/* opacity-0 + group-hover only reveals these on devices with a
                  real :hover state. On a phone there's no hover, so Copy/
                  Delete were invisible and effectively undiscoverable —
                  show them plainly below sm, keep the hover-reveal polish
                  for desktop/mouse. */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyUrl(item)}
                  aria-label="Copy URL"
                  className="w-7 h-7 bg-void/80 text-white flex items-center justify-center chamfer-sm hover:bg-void"
                >
                  {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete"
                  className="w-7 h-7 bg-void/80 text-white flex items-center justify-center chamfer-sm hover:bg-red"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
