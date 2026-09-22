import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/storefront/product-card";

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
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Browse all products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
