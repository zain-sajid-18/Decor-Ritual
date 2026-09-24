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
      <div className="flex aspect-square w-full flex-col items-center justify-center rounded-3xl border border-stone-200/80 bg-stone-50 p-8 text-center text-stone-400 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-500 shadow-sm">
        <svg
          className="h-16 w-16 stroke-1 text-stone-300 dark:text-stone-600"
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
        <span className="mt-3 text-sm font-medium">No product photography available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Image Viewport */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || `${productTitle} - Image ${selectedIndex + 1}`}
          fill
          priority
          loading="eager"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain object-center p-4 transition-all duration-300"
        />
      </div>

      {/* Thumbnail Selector (only shown when multiple images exist) */}
      {sortedImages.length > 1 && (
        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Product photography thumbnails">
          {sortedImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View photography ${idx + 1} of ${sortedImages.length}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-20 w-20 sm:h-22 sm:w-22 overflow-hidden rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? "border-amber-500 shadow-sm ring-2 ring-amber-500/20"
                    : "border-stone-200 bg-white hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-600 opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  fill
                  sizes="88px"
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
