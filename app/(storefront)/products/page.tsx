import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Products | ZF Store",
  description: "Browse all curated products available in the ZF Store catalog.",
};

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StorefrontProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams?.q === "string" ? resolvedParams.q : undefined;
  const categorySlug = typeof resolvedParams?.category === "string" ? resolvedParams.category : undefined;

  const [products, categories] = await Promise.all([
    getProducts({
      search: query,
      categorySlug,
    }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <PageHeader
        title="Product Discovery"
        description="Explore our curated collection of verified products. Select an item to inspect details and view on Amazon."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-50 p-4 rounded-lg border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
        <form method="GET" className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            name="q"
            defaultValue={query || ""}
            placeholder="Search products..."
            className="flex h-9 w-full sm:w-64 rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />

          <select
            name="category"
            defaultValue={categorySlug || ""}
            className="flex h-9 rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            Filter
          </button>

          {(query || categorySlug) && (
            <Link
              href="/products"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
            >
              Reset
            </Link>
          )}
        </form>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="We could not find any products matching your current filters."
          action={
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Clear filters
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {product.brand ? (
                    <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                      {product.brand}
                    </span>
                  ) : (
                    <span />
                  )}
                  {product.featured && (
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      Featured
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300 line-clamp-2">
                  {product.title}
                </h3>

                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                  {product.shortDescription}
                </p>

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Inspect product</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
