"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

export default function ProductImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-paper dark:bg-void/60 text-steel">
        <ImageOff size={28} strokeWidth={1.5} />
        <span className="text-[11px]">Image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
