import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage =
    product.images && product.images.length > 0
      ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]
      : null;

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-400/50 dark:hover:border-amber-500/40">
      
      {/* Photography Viewport */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 focus:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.title}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-stone-300 dark:text-stone-600">
            <svg className="h-10 w-10 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-1 text-xs text-stone-400">Object</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
          {product.recommended && !product.featured && (
            <span className="inline-flex items-center rounded-full bg-stone-900/80 dark:bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white dark:text-stone-900 shadow-sm">
              Curator Pick
            </span>
          )}
        </div>

        {/* Prime Indicator */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-stone-700 dark:text-stone-300 shadow-xs border border-white/40 dark:border-stone-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Prime
          </span>
        </div>
      </Link>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        {/* Brand */}
        {product.brand && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="flex-1 text-[15px] font-bold leading-snug text-stone-900 dark:text-stone-100 line-clamp-2 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          <Link href={`/products/${product.slug}`}>
            {product.title}
          </Link>
        </h3>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="mb-4 text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:text-stone-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* High-Converting CTA Button */}
        <div className="mt-auto pt-2 border-t border-stone-100 dark:border-stone-800">
          <Link
            href={`/products/${product.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
          >
            <span>View Details</span>
            <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
