import type { MetadataRoute } from "next";

/**
 * Standard Robots.txt route for Next.js App Router
 *
 * Instructs search engines to crawl public storefront discovery pages
 * while explicitly disallowing crawling of internal admin routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
  };
}
