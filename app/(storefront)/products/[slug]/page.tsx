import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data/products";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { Badge } from "@/components/ui/badge";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | ZF Store",
    };
  }

  const title = product.seo?.title || `${product.title} | ZF Store`;
  const description =
    product.seo?.description || product.shortDescription || "Curated product discovery at ZF Store.";

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images:
        product.images && product.images.length > 0
          ? [{ url: product.images[0].url, alt: product.images[0].alt || product.title }]
          : undefined,
    },
  };
}

export default async function StorefrontProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        {product.categorySlug ? (
          <>
            <Link
              href={`/?category=${encodeURIComponent(product.categorySlug)}`}
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors capitalize"
            >
              {product.categorySlug.replace(/-/g, " ")}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-xs sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Product Visuals / Image Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images || []} productTitle={product.title} />
        </div>

        {/* Right Column: Product Information and Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            {/* Brand & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.brand && (
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                  {product.brand}
                </span>
              )}
              {product.featured && <Badge variant="success">Featured</Badge>}
              {product.recommended && <Badge variant="outline">Recommended</Badge>}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              {product.title}
            </h1>

            {/* Category Link */}
            {product.categorySlug && (
              <div className="pt-0.5">
                <Link
                  href={`/?category=${encodeURIComponent(product.categorySlug)}`}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 capitalize underline"
                >
                  Category: {product.categorySlug.replace(/-/g, " ")}
                </Link>
              </div>
            )}
          </div>

          {/* Short Description */}
          <div className="text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-300">
            {product.shortDescription}
          </div>

          {/* Primary Outbound Amazon Destination CTA */}
          <div className="space-y-3 pt-2">
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-zinc-900 px-6 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span>View on Amazon</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            {/* Transparent Amazon Associates Disclosure */}
            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              External link. You will be redirected to Amazon for purchasing and fulfillment. ZF Store may earn an affiliate commission on qualifying purchases at no additional cost to you.
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Tags & Aesthetics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Full Description */}
          {product.description && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Product Details
              </h2>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
