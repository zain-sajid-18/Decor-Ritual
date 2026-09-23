import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/config";

/**
 * Standard Robots.txt route for Next.js App Router
 *
 * Instructs search engines to crawl public storefront discovery pages
 * while explicitly disallowing crawling of internal admin routes.
 *
 * Note: robots.txt is NOT an authentication boundary; the real security
 * boundary is enforced by session authentication in middleware and DAL.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
