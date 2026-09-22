import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.images && product.images.length > 0
      ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]
      : null;

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 overflow-hidden">
      <div>
        {/* Product Visual Container */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          tabIndex={-1}
          aria-hidden="true"
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-zinc-400 dark:text-zinc-500">
              <svg
                className="h-10 w-10 stroke-1"
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
              <span className="mt-2 text-xs font-normal">No image available</span>
            </div>
          )}

          {product.featured && (
            <div className="absolute top-2.5 left-2.5">
              <Badge variant="success" className="text-[10px] font-medium shadow-sm">
                Featured
              </Badge>
            </div>
          )}
        </Link>

        {/* Card Details */}
        <div className="p-4 sm:p-5 space-y-2">
          {/* Brand & Category header */}
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {product.brand ? (
              <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                {product.brand}
              </span>
            ) : (
              <span />
            )}
            {product.categorySlug && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate capitalize">
                {product.categorySlug.replace(/-/g, " ")}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300 line-clamp-2">
            <Link
              href={`/products/${product.slug}`}
              className="focus:outline-none focus:underline"
            >
              {product.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer CTA */}
      <div className="border-t border-zinc-100 px-4 py-3 sm:px-5 dark:border-zinc-800/80">
        <Link
          href={`/products/${product.slug}`}
          className="flex items-center justify-between text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          <span>Inspect details</span>
          <span className="transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
