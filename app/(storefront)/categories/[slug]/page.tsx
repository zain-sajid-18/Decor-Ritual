import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

type CategoryDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | ZF Store",
    };
  }

  return {
    title: category.seo?.title || `${category.name} | ZF Store`,
    description:
      category.seo?.description ||
      category.description ||
      `Explore curated ${category.name} products on ZF Store.`,
  };
}

export default async function StorefrontCategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Categories
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          {category.name}
        </span>
      </nav>

      <PageHeader
        title={category.name}
        description={
          category.description ||
          `Browse all published products currently assigned to ${category.name}.`
        }
      />

      {/* Product Grid */}
      {products.length === 0 ? (
        <EmptyState
          title="No products in this category"
          description="There are currently no published products assigned to this category."
          action={
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Browse all products
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
                  {product.brand && (
                    <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                      {product.brand}
                    </span>
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
      )}
    </div>
  );
}
