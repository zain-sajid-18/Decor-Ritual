/**
 * Supported Amazon Regional Domains & Hostnames
 *
 * Defines the strict list of authorized Amazon domain names supported
 * by the ZF Store outbound link architecture.
 */

export const SUPPORTED_AMAZON_DOMAINS = [
  "amazon.com",
  "amazon.co.uk",
  "amazon.ca",
  "amazon.de",
  "amazon.fr",
  "amazon.it",
  "amazon.es",
  "amazon.co.jp",
  "amazon.in",
  "amazon.com.au",
  "amazon.com.mx",
  "amazon.com.br",
  "amazon.nl",
  "amazon.se",
  "amazon.pl",
  "amazon.sg",
  "amazon.ae",
  "amazon.sa",
  // Short URLs are included for domain validation purposes, but NOTE:
  // these shorteners drop query parameters during redirect, meaning
  // affiliate tags appended to them are silently lost. See isAmazonShortUrl().
  "amzn.to",
  "a.co",
  "link.amazon",
  "amzn.com",
] as const;

export type SupportedAmazonDomain = (typeof SUPPORTED_AMAZON_DOMAINS)[number];

/**
 * Amazon short URL domains that use server-side 301 redirects.
 *
 * CRITICAL: These shorteners do NOT pass query parameters (like ?tag=xxx)
 * through to the destination URL. Appending an affiliate tag to these URLs
 * results in SILENT COMMISSION LOSS — the tag is dropped before the user
 * ever reaches the product page on amazon.com.
 *
 * Always use the full amazon.com product URL for affiliate links:
 *   ✅ https://www.amazon.com/dp/B07T29JHLF
 *   ❌ https://amzn.to/3XyZ123   (tag will be lost)
 *   ❌ https://a.co/d/abc123     (tag will be lost)
 *   ❌ https://link.amazon/xyz   (tag will be lost)
 */
export const AMAZON_SHORT_URL_DOMAINS = [
  "amzn.to",
  "a.co",
  "link.amazon",
  "amzn.com",
] as const;

/**
 * Returns true if the given URL is a known Amazon short link.
 *
 * Short links do not carry query parameters through their 301 redirect,
 * so the affiliate ?tag= parameter would be silently dropped.
 */
export function isAmazonShortUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") {
    return false;
  }
  try {
    const url = new URL(urlString.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return AMAZON_SHORT_URL_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates that an outbound destination URL is a legitimate Amazon product URL.
 *
 * Prevents arbitrary malicious external links from being disguised as Amazon
 * outbound affiliate destinations.
 *
 * In non-production environments, permits example.com solely for development
 * fixture and unit testing purposes.
 */
export function isValidAmazonUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") {
    return false;
  }

  try {
    const url = new URL(urlString.trim());

    // Protocol must be standard secure HTTP/HTTPS
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    // Development fixture accommodation (strictly non-production)
    if (
      process.env.NODE_ENV !== "production" &&
      (hostname === "example.com" || hostname.endsWith(".example.com"))
    ) {
      return true;
    }

    // Must match one of the supported Amazon root domains or legitimate subdomains
    return SUPPORTED_AMAZON_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
