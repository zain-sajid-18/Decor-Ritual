/**
 * Amazon Associates Configuration
 *
 * Centralizes retrieval of the Amazon Associates tracking ID.
 *
 * CRITICAL RULE:
 * Never fabricate or hardcode fake Associates tags (e.g. "zfstore-20").
 * If no tag is explicitly configured in the environment, affiliate parameter
 * injection is cleanly bypassed and the original Amazon URL is preserved.
 */

export function getAmazonAssociateTag(): string | undefined {
  const tag =
    process.env.AMAZON_ASSOCIATE_TAG ||
    process.env.AMAZON_AFFILIATE_TAG ||
    process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG;

  if (!tag || tag.trim().length === 0) {
    return undefined;
  }

  return tag.trim();
}

/**
 * Returns true if an Amazon Associates tracking tag is currently configured.
 */
export function isAmazonAffiliateConfigured(): boolean {
  return getAmazonAssociateTag() !== undefined;
}
