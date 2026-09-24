import type { Product } from "@/types/product";

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Safe JSON-LD Serialization Component
 *
 * Serializes structured data and sanitizes script content to prevent
 * arbitrary HTML / script injection (XSS defense).
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

/**
 * Truthful Schema.org Product Structured Data
 *
 * Emits ONLY verified properties supported by our data model:
 * - name
 * - description
 * - image (if real Cloudinary/fixture image exists)
 * - brand (if present)
 * - sku (if ASIN is present)
 * - url
 *
 * CRITICAL RULE:
 * Strictly avoids fabricating unsupported commercial fields such as
 * offers.price, aggregateRating, review, reviewCount, or availability.
 */
export function ProductJsonLd({
  product,
  siteUrl,
}: {
  product: Product;
  siteUrl: string;
}) {
  const primaryImage =
    product.images && product.images.length > 0
      ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]
      : null;

  const productUrl = `${siteUrl}/products/${product.slug}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.shortDescription || product.title,
    url: productUrl,
  };

  if (primaryImage?.url) {
    schema.image = product.images.map((img) => img.url);
  }

  if (product.brand) {
    schema.brand = {
      "@type": "Brand",
      name: product.brand,
    };
  }

  if (product.asin) {
    schema.sku = product.asin;
  }

  if (product.categorySlug) {
    schema.category = product.categorySlug;
  }

  return <JsonLd data={schema} />;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Schema.org BreadcrumbList Structured Data
 *
 * Matches the actual, visible navigation hierarchy:
 * Home -> Category (if present) -> Product
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={schema} />;
}
