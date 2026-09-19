import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data/products";
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

  return {
    title: product.seo?.title || `${product.title} | ZF Store`,
    description: product.seo?.description || product.shortDescription,
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Products
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Visual Area */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-center p-8 text-center">
            {product.images && product.images.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">{product.images[0].alt || "Product image"}</span>
              </div>
            ) : (
              <div className="text-xs text-zinc-400">No product image available</div>
            )}
          </div>

          {/* Development Fixture Notice */}
          <div className="rounded border border-dashed border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            <span className="font-semibold">Development Fixture:</span> This item demonstrates detail layout and DAL retrieval.
          </div>
        </div>

        {/* Product Information Area */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {product.brand && (
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                  {product.brand}
                </span>
              )}
              {product.featured && <Badge variant="success">Featured</Badge>}
              {product.recommended && <Badge variant="outline">Recommended</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {product.title}
            </h1>

            {product.categorySlug && (
              <div className="pt-1">
                <Link
                  href={`/categories/${product.categorySlug}`}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline"
                >
                  Category: {product.categorySlug}
                </Link>
              </div>
            )}
          </div>

          {/* Short Description */}
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {product.shortDescription}
          </div>

          {/* Outbound Amazon Primary CTA */}
          <div className="space-y-3 pt-2">
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span>View on Amazon</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Contextual Affiliate Notice */}
            <p className="text-[11px] leading-normal text-zinc-500 dark:text-zinc-400">
              External link. You will be redirected to the Amazon product page. ZF Store may earn an affiliate commission on qualifying purchases at no additional cost to you.
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Tags & Aesthetics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Product Overview
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
