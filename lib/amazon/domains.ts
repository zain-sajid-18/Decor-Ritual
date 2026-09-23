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
  "amzn.to",
  "a.co",
] as const;

export type SupportedAmazonDomain = (typeof SUPPORTED_AMAZON_DOMAINS)[number];

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
