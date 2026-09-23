import { getAmazonAssociateTag } from "./config";

/**
 * Central Amazon Outbound Link Builder
 *
 * Implements safe, idempotent URL parameter manipulation for Amazon outbound destinations:
 * 1. Safely parses destination URL using standard URL API.
 * 2. Applies the configured Associates tag (if available) via `searchParams.set("tag", ...)`.
 * 3. Idempotently replaces any existing 'tag' query parameter so it is applied exactly once.
 * 4. Preserves all other legitimate Amazon query parameters (e.g. ASIN modifiers, variants).
 * 5. If no Associates tag is configured, preserves the original destination URL intact.
 */
export function buildAmazonOutboundUrl(
  originalUrl: string,
  tagOverride?: string
): string {
  if (!originalUrl || typeof originalUrl !== "string") {
    return "#";
  }

  const trimmed = originalUrl.trim();
  if (!trimmed) {
    return "#";
  }

  try {
    const parsed = new URL(trimmed);
    const tag = tagOverride ?? getAmazonAssociateTag();

    if (tag && tag.length > 0) {
      parsed.searchParams.set("tag", tag);
    }

    return parsed.toString();
  } catch {
    // If URL cannot be parsed by URL constructor, return original trimmed string
    return trimmed;
  }
}

/**
 * Convenience accessor for product models.
 * Used across storefront components to generate outbound Amazon destinations.
 */
export function getAmazonOutboundUrl(product: { amazonUrl: string }): string {
  if (!product || !product.amazonUrl) {
    return "#";
  }

  return buildAmazonOutboundUrl(product.amazonUrl);
}
