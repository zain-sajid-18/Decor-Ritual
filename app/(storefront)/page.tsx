import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPaginatedProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import type { ProductSortOption } from "@/types/product";
import { ProductCard } from "@/components/storefront/product-card";
import { SearchInput } from "@/components/storefront/search-input";
import { FilterSortBar } from "@/components/storefront/filter-sort-bar";
import { Pagination } from "@/components/storefront/pagination";

export const metadata: Metadata = {
  title: "ZF Store | Curated Home Decor & Lifestyle Objects",
  description:
    "Discover intentional, design-forward objects curated for modern spaces. Products fulfilled by Amazon.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ZF Store | Curated Home Decor & Lifestyle Objects",
    description:
      "Discover intentional, design-forward objects curated for modern spaces. Products fulfilled by Amazon.",
    url: "/",
    siteName: "ZF Store",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZF Store | Curated Home Decor & Lifestyle Objects",
    description:
      "Discover intentional, design-forward objects curated for modern spaces. Products fulfilled by Amazon.",
  },
};

type StorefrontHomePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StorefrontHomePage({
  searchParams,
}: StorefrontHomePageProps) {
  const resolvedParams = await searchParams;

  const query =
    typeof resolvedParams.q === "string" && resolvedParams.q.trim()
      ? resolvedParams.q.trim()
      : undefined;

  const categorySlug =
    typeof resolvedParams.category === "string" && resolvedParams.category.trim()
      ? resolvedParams.category.trim()
      : undefined;

  const sort = (
    typeof resolvedParams.sort === "string" && ["featured", "newest", "a-z"].includes(resolvedParams.sort)
      ? resolvedParams.sort
      : "featured"
  ) as ProductSortOption;

  const parsedPage =
    typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Retrieve published products and active categories via Public DAL
  const [paginatedData, categories] = await Promise.all([
    getPaginatedProducts({
      search: query,
      categorySlug,
      sort,
      page: currentPage,
      pageSize: 12,
    }),
    getCategories(),
  ]);

  const { products, totalCount, totalPages } = paginatedData;
  const hasActiveFilters = Boolean(query || categorySlug || (sort && sort !== "featured"));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      
      {/* Radiant Visual Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-stone-50/80 p-6 sm:p-10 lg:p-12 dark:border-stone-800 dark:from-amber-950/20 dark:via-stone-900/60 dark:to-stone-950 shadow-sm transition-all">
        {/* Ambient Warm Nebula Glow */}
        <div
          className="pointer-events-none absolute -top-24 right-10 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Compelling Copy & Instant Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-white/90 dark:bg-stone-900/90 dark:border-amber-500/30 px-3.5 py-1 text-xs font-semibold tracking-wide text-amber-800 dark:text-amber-300 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span>Curated Living & Modern Rituals</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]">
              Objects designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-300">thoughtful living.</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300">
              A hand-picked collection of sculptural seating, ambient lighting, and tactile ceramics. Every piece is verified for craft and fulfilled directly by Amazon.
            </p>

            {/* Search Input Bar */}
            <div className="max-w-xl pt-1">
              <SearchInput initialQuery={query || ""} />
            </div>

            {/* Trust Assurances */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Amazon Prime Eligible
              </span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Amazon A-to-z Guarantee
              </span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Curator Quality Vetted
              </span>
            </div>
            {/* FTC-required disclosure — visible above the fold near affiliate links */}
            <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-1">
              As an Amazon Associate, we earn from qualifying purchases. Prices subject to change.
            </p>
          </div>

          {/* Right Column: Visual Showcase Spotlight Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 group">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Curated modern living interior"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Floating Highlight Banner */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 dark:bg-stone-900/90 p-4 shadow-lg backdrop-blur-md border border-white/20 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Curator Spotlight
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    Nordic Sculptural Living
                  </h3>
                </div>
                <Link
                  href="/categories"
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills & Sort Controls */}
      <FilterSortBar
        categories={categories}
        currentCategory={categorySlug}
        currentSort={sort}
        totalCount={totalCount}
      />

      {/* Products Presentation Grid */}
      {products.length === 0 ? (
        <div className="my-12 rounded-3xl border border-stone-200/80 bg-white/70 p-12 text-center dark:border-stone-800 dark:bg-stone-900/40 shadow-sm">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {hasActiveFilters ? "No objects match your current filter" : "Catalog being refreshed"}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {hasActiveFilters
                ? "Try searching for alternate keywords, choosing another collection, or resetting active filters."
                : "New curated artifacts are currently being added to this collection."}
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
                >
                  Reset All Filters
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Responsive Product Grid with vibrant spacing */}
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={resolvedParams}
          />
        </>
      )}
    </div>
  );
}
