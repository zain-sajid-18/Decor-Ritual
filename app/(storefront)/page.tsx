import Link from "next/link";
import { getFeaturedProducts, getRecommendedProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "ZF Store | Curated Product Discovery",
  description:
    "Explore curated collections and discovery guides. Direct links to Amazon for secure checkout and rapid fulfillment.",
};

export default async function StorefrontHomePage() {
  const [featuredProducts, recommendedProducts, categories] = await Promise.all([
    getFeaturedProducts(4),
    getRecommendedProducts(4),
    getCategories(),
  ]);

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Development Fixture Notice */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <span className="font-semibold uppercase tracking-wider">Dev Environment:</span>
          <span>Catalog currently displays development fixtures for architecture and UI validation.</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <Badge variant="outline" className="text-zinc-600 dark:text-zinc-400">
            Curated Discovery Platform
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            Thoughtfully curated products, fulfilled by Amazon.
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            ZF Store connects you with purposeful products across curated lifestyle categories.
            Browse our selections, inspect details, and transition directly to Amazon for trusted
            checkout and delivery.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              Explore All Products →
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Active Categories Section */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Explore Categories
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Browse our active catalog taxonomy
              </p>
            </div>
            <Link
              href="/categories"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              View all →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">#{cat.displayOrder}</span>
                </div>
                {cat.description && (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <div className="mt-4 flex items-center text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Discover category <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Featured Selections
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Hand-picked spotlight items from our collection
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              All products →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {product.brand && (
                      <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                        {product.brand}
                      </span>
                    )}
                    <Badge variant="success" className="text-[10px] px-2 py-0">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">View details</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Recommended by ZF Store
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Curator favorites with proven utility
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Browse catalog →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {product.brand && (
                      <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                        {product.brand}
                      </span>
                    )}
                    <Badge variant="outline" className="text-[10px] px-2 py-0">
                      Recommended
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">View details</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
