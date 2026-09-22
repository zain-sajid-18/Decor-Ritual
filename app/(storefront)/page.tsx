import Link from "next/link";
import type { Metadata } from "next";
import { getPaginatedProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import type { ProductSortOption } from "@/types/product";
import { ProductCard } from "@/components/storefront/product-card";
import { SearchInput } from "@/components/storefront/search-input";
import { FilterSortBar } from "@/components/storefront/filter-sort-bar";
import { Pagination } from "@/components/storefront/pagination";

export const metadata: Metadata = {
  title: "ZF Store | Product Discovery",
  description:
    "Discover purposeful, verified products curated for utility and quality. Direct links to Amazon for fulfillment.",
  alternates: {
    canonical: "/",
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Discovery Shell: Store identity and search */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Curated Products
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Explore quality items curated for everyday utility and home living.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-auto sm:min-w-[320px]">
          <SearchInput initialQuery={query || ""} />
        </div>
      </div>

      {/* Category Pills & Sort Controls */}
      <FilterSortBar
        categories={categories}
        currentCategory={categorySlug}
        currentSort={sort}
        totalCount={totalCount}
      />

      {/* Products Presentation */}
      {products.length === 0 ? (
        <div className="my-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="mx-auto max-w-md space-y-3">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {hasActiveFilters ? "No products matched your search" : "No products available yet"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {hasActiveFilters
                ? "Try adjusting your search terms, choosing a different category, or clearing the active filters."
                : "Our catalog is currently being updated. Please check back soon."}
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Responsive Product Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
