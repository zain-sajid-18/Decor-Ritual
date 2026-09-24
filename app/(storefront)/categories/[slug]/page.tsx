import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
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
      title: "Collection Not Found | ZF Store",
    };
  }

  const title = category.seo?.title || `${category.name} | ZF Store`;
  const description =
    category.seo?.description ||
    category.description ||
    `Explore curated ${category.name} objects on ZF Store.`;

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
    { name: "Collections", url: `${siteUrl}/categories` },
    { name: category.name, url: `${siteUrl}/categories/${category.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
            Catalog
          </Link>
          <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">/</span>
          <Link href="/categories" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
            Collections
          </Link>
          <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">/</span>
          <span className="text-stone-900 dark:text-stone-100 font-semibold">
            {category.name}
          </span>
        </nav>

        {/* Collection Header */}
        <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300 mb-2">
            Collection Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            {category.name}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
            {category.description || `Curated selection of verified artifacts in ${category.name}.`}
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <EmptyState
            title="No objects in this collection"
            description="There are currently no published products assigned to this category."
            action={
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
              >
                Browse all products
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
