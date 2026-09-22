"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = sortedImages[selectedIndex] ?? null;

  if (sortedImages.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-500">
        <svg
          className="h-16 w-16 stroke-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="mt-3 text-sm font-medium">No product images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Image Viewport */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || `${productTitle} - Image ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain object-center transition-all duration-200"
        />
      </div>

      {/* Thumbnail Selector (only shown when multiple images exist) */}
      {sortedImages.length > 1 && (
        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Product image thumbnails">
          {sortedImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View image ${idx + 1} of ${sortedImages.length}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-18 w-18 sm:h-20 sm:w-20 overflow-hidden rounded-lg border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${
                  isSelected
                    ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600 opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
