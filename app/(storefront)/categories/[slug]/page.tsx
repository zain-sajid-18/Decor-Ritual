import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/storefront/product-card";
import { getSiteUrl } from "@/lib/seo/config";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

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

  const title = category.seo?.title || `${category.name} | ZF Store`;
  const description =
    category.seo?.description ||
    category.description ||
    `Explore curated ${category.name} products on ZF Store.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/categories/${category.slug}`,
      siteName: "ZF Store",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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

  const siteUrl = getSiteUrl();
  const breadcrumbItems = [
    { name: "Home", url: `${siteUrl}/` },
    { name: "Categories", url: `${siteUrl}/categories` },
    { name: category.name, url: `${siteUrl}/categories/${category.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/categories" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Categories
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">
            {category.name}
          </span>
        </nav>

        {/* Category Header */}
        <PageHeader
          title={category.name}
          description={
            category.description ||
            `Curated selection of verified products in ${category.name}.`
          }
        />

        {/* Products Grid */}
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
    </>
  );
}
