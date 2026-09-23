/**
 * SEO & Site URL Configuration
 *
 * Centralizes resolution of the canonical site URL for:
 * - MetadataBase
 * - Canonical link generation
 * - Open Graph & Twitter URL generation
 * - Sitemap generation
 * - Robots.txt sitemap reference
 */

export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (envUrl && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  }

  // Fallback for local development
  return "http://localhost:3000";
}
