import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data/products";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { Badge } from "@/components/ui/badge";
import { getAmazonOutboundUrl } from "@/lib/amazon/url";
import { getSiteUrl } from "@/lib/seo/config";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

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
    product.seo?.description ||
    product.shortDescription ||
    "Curated product discovery at ZF Store.";

  const primaryImage =
    product.images && product.images.length > 0
      ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]
      : null;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/products/${product.slug}`,
      siteName: "ZF Store",
      type: "website",
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              alt: primaryImage.alt || product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage.url] : undefined,
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

  const siteUrl = getSiteUrl();
  const amazonOutboundUrl = getAmazonOutboundUrl(product);

  const breadcrumbItems = [
    { name: "Home", url: `${siteUrl}/` },
    ...(product.categorySlug
      ? [
          {
            name: product.categorySlug.replace(/-/g, " "),
            url: `${siteUrl}/categories/${product.categorySlug}`,
          },
        ]
      : []),
    { name: product.title, url: `${siteUrl}/products/${product.slug}` },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <ProductJsonLd product={product} siteUrl={siteUrl} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400"
        >
          <Link
            href="/"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
          >
            Catalog
          </Link>
          <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">/</span>
          {product.categorySlug ? (
            <>
              <Link
                href={`/categories/${encodeURIComponent(product.categorySlug)}`}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors capitalize font-medium"
              >
                {product.categorySlug.replace(/-/g, " ")}
              </Link>
              <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">/</span>
            </>
          ) : null}
          <span className="text-stone-900 dark:text-stone-100 font-semibold truncate max-w-xs sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Product Visuals / Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images || []}
              productTitle={product.title}
            />
          </div>

          {/* Right Column: Product Information and Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              {/* Brand & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <span className="text-xs uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400">
                    {product.brand}
                  </span>
                )}
                {product.featured && (
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Featured Item
                  </span>
                )}
                {product.recommended && (
                  <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-bold">
                    Curator Verified
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
                {product.title}
              </h1>

              {/* Collection Link */}
              {product.categorySlug && (
                <div className="pt-0.5">
                  <Link
                    href={`/categories/${encodeURIComponent(product.categorySlug)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-600 dark:text-stone-300 dark:hover:text-amber-400 capitalize transition-colors"
                  >
                    <span>Collection:</span>
                    <span className="underline decoration-amber-500 decoration-2 underline-offset-4">{product.categorySlug.replace(/-/g, " ")}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm font-normal leading-relaxed text-stone-600 dark:text-stone-300">
                {product.shortDescription}
              </p>
            )}

            {/* Radiant Outbound Amazon CTA Button */}
            <div className="space-y-4 pt-2">
              <a
                href={amazonOutboundUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="group relative flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/35 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span>View & Purchase on Amazon</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-100 font-semibold">
                  <span>Prime Eligible</span>
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </a>

              {/* 3-Point Value Assurance Card */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-stone-200/80 bg-stone-50/80 dark:border-stone-800 dark:bg-stone-900/50 p-3.5 text-center">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Amazon Direct</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">Secure Checkout</div>
                </div>
                <div className="space-y-0.5 border-x border-stone-200 dark:border-stone-800">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Amazon Returns</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">A-to-z Guarantee</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">Curator Vetted</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">Editorially Selected</div>
                </div>
              </div>

              {/* Amazon Affiliate Disclosure — required near every affiliate link */}
              <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                <strong className="text-stone-600 dark:text-stone-300">Affiliate disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases. You will be redirected to Amazon.com to complete your purchase. Prices are subject to change — the price shown on Amazon at the time of your order is the final price.
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                  Tags & Aesthetics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-stone-100 dark:bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Product Specifications */}
            {product.description && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                  Product Details & Specifications
                </h2>
                <div className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
