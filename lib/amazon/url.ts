import { getAmazonAssociateTag } from "./config";

/**
 * Amazon short URL domains that use server-side 301 redirects.
 *
 * CRITICAL: These shorteners do NOT pass query parameters (like ?tag=xxx)
 * through to the destination URL. Appending an affiliate tag to these URLs
 * results in SILENT COMMISSION LOSS — the tag is dropped before the user
 * ever reaches the product page on amazon.com.
 *
 * Always use the full amazon.com product URL for affiliate links:
 *   ✅ https://www.amazon.com/dp/B0DK97H9MZ
 *   ❌ https://amzn.to/3XyZ123   (tag will be lost)
 *   ❌ https://a.co/d/abc123     (tag will be lost)
 *   ❌ https://link.amazon/xyz   (tag will be lost)
 */
const AMAZON_SHORT_URL_HOSTNAMES = [
  "amzn.to",
  "a.co",
  "link.amazon",
  "amzn.com",
] as const;

/**
 * Session-based and volatile Amazon query parameters that should be stripped
 * from stored product URLs.
 *
 * These parameters are generated per-user-session when browsing Amazon or
 * using the Associates Link Builder. They:
 * - Expire after the session ends (hours/days)
 * - Contain no product-specific information
 * - Add significant URL clutter
 * - Can cause stale/broken tracking if stored long-term
 *
 * The ASIN is always in the URL path (e.g. /dp/B0DK97H9MZ), so none of these
 * parameters are needed to identify or link to the product.
 */
const VOLATILE_AMAZON_PARAMS = new Set([
  // Amazon session / placement tracking
  "pd_rd_w",
  "pd_rd_wg",
  "pd_rd_r",
  "pd_rd_i",
  "pf_rd_p",
  "pf_rd_r",
  "content-id",
  // Associates Link Builder metadata (we manage tag ourselves via env)
  "linkCode",
  "linkId",
  // Locale / analytics noise
  "language",
  "gaOptInStatus",
  // Referrer tags (Amazon internal)
  "ref_",
  "ref",
  // Search/browse noise params
  "ie",
  "qid",
  "sr",
  "keywords",
  "sprefix",
  "crid",
  "dib",
  "dib_tag",
  // Additional Associates link builder fields
  "ascsubtag",
  "asc_campaign",
  "asc_refurl",
  "asc_source",
  "smid",
]);

/**
 * Returns true if the given URL is a known Amazon short link.
 * Short links do not carry query parameters through their 301 redirect,
 * so the affiliate ?tag= parameter would be silently dropped.
 */
export function isAmazonShortUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const url = new URL(urlString.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return AMAZON_SHORT_URL_HOSTNAMES.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Sanitizes an Amazon product URL for storage in the database.
 *
 * Handles ALL input scenarios:
 *   ✅ Clean URL with no params
 *   ✅ URL already containing our affiliate tag   → tag stripped (re-injected at render time)
 *   ✅ URL with a FOREIGN affiliate tag           → tag stripped (never store someone else's tag)
 *   ✅ URL with empty tag= value                  → tag stripped
 *   ✅ URL with volatile session params           → all stripped
 *   ✅ URL with linkCode/linkId from Associates   → stripped
 *   ✅ URL using HTTP instead of HTTPS            → upgraded to HTTPS
 *   ✅ URL with variant selector (th=1)           → preserved
 *   ✅ Already-clean URL                          → returned unchanged (idempotent)
 *
 * Example:
 *   Input:  https://www.amazon.com/dp/B0DK97H9MZ?pd_rd_w=G6mhD&tag=megastore512-20&linkCode=ll2&th=1
 *   Output: https://www.amazon.com/dp/B0DK97H9MZ?th=1
 */
export function sanitizeAmazonUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;

  try {
    const url = new URL(rawUrl.trim());

    // Upgrade HTTP to HTTPS — Amazon always uses HTTPS
    if (url.protocol === "http:") {
      url.protocol = "https:";
    }

    // Collect all params to remove: volatile session params + any existing tag
    // Tag is NEVER stored — it's always injected fresh from env at render time.
    // This prevents: our stale tag, foreign tags, or empty tags from persisting.
    const toDelete: string[] = [];
    for (const key of url.searchParams.keys()) {
      if (VOLATILE_AMAZON_PARAMS.has(key) || key === "tag") {
        toDelete.push(key);
      }
    }
    toDelete.forEach((key) => url.searchParams.delete(key));

    // Return clean path-only URL if no meaningful params remain
    if (url.searchParams.size === 0) {
      return `${url.origin}${url.pathname}`;
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Central Amazon Outbound Link Builder — called at page render time.
 *
 * Handles ALL render-time scenarios:
 *
 *   Scenario A: clean URL,       env tag set    → injects tag                  ✅
 *   Scenario B: clean URL,       env tag empty  → returns clean URL            ✅
 *   Scenario C: URL has OUR tag, env tag set    → replaces (idempotent)        ✅
 *   Scenario D: URL has OUR tag, env tag empty  → strips tag (never foreign)  ✅
 *   Scenario E: URL has DIFF tag, env tag set   → replaces with our tag        ✅
 *   Scenario F: URL has DIFF tag, env tag empty → strips foreign tag           ✅
 *   Scenario G: URL has empty tag=, env tag set → replaces with our tag        ✅
 *   Scenario H: URL has multi tag= params       → collapses to one             ✅
 *   Scenario I: short URL (amzn.to, link.amazon)→ returned as-is, no tag      ✅
 *   Scenario J: tagOverride provided            → uses override instead of env ✅
 *
 * The function is fully defensive: it always strips whatever tag exists first,
 * then conditionally re-adds either the env tag or the override. This ensures
 * we NEVER serve a URL with a foreign affiliate tag.
 */
export function buildAmazonOutboundUrl(
  originalUrl: string,
  tagOverride?: string
): string {
  if (!originalUrl || typeof originalUrl !== "string") return "#";

  const trimmed = originalUrl.trim();
  if (!trimmed) return "#";

  try {
    // Short URLs silently drop query params during 301 redirect.
    // Tag injection is meaningless here — return the URL unchanged.
    if (isAmazonShortUrl(trimmed)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Amazon] Short URL detected: "${trimmed}". ` +
            `Affiliate tag NOT applied — short URLs drop query params during redirect. ` +
            `Use the full amazon.com/dp/ASIN URL to ensure tag attribution.`
        );
      }
      return trimmed;
    }

    const parsed = new URL(trimmed);

    // Step 1: Always remove ALL existing tag params first.
    // This handles: our own stale tag, foreign tags, empty tags, duplicate tags.
    // We NEVER want to serve a URL with an uncontrolled or foreign affiliate tag.
    parsed.searchParams.delete("tag");

    // Step 2: Resolve which tag to use (override takes priority over env)
    const tag = tagOverride !== undefined
      ? tagOverride
      : getAmazonAssociateTag();

    // Step 3: Inject our tag only if it's a non-empty string
    if (tag && tag.trim().length > 0) {
      parsed.searchParams.set("tag", tag.trim());
    }

    // Step 4: If no params remain after tag deletion + possible re-add,
    // return a clean URL without trailing "?"
    if (parsed.searchParams.size === 0) {
      return `${parsed.origin}${parsed.pathname}`;
    }

    return parsed.toString();
  } catch {
    // Malformed URL — return original rather than "#" to avoid broken links
    return trimmed;
  }
}

/**
 * Convenience accessor for product models.
 * Used across storefront components to generate outbound Amazon destinations.
 */
export function getAmazonOutboundUrl(product: { amazonUrl: string }): string {
  if (!product || !product.amazonUrl) return "#";
  return buildAmazonOutboundUrl(product.amazonUrl);
}
