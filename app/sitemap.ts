import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { getSiteUrl } from "@/lib/seo/config";

/**
 * Dynamic Next.js Sitemap Generation
 *
 * Produces /sitemap.xml for search engine indexing containing exclusively
 * legitimate public URLs:
 * - Home discovery page (/)
 * - Taxonomy categories directory (/categories)
 * - Published products (/products/[slug])
 * - Active categories (/categories/[slug])
 *
 * Strictly omits:
 * - Internal admin routes (/admin/*)
 * - Draft and archived products
 * - Inactive categories
 * - Query-parameter filter variants
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/disclosure`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Retrieve published products via Public DAL (draft/archived filtered automatically)
  const products = await getProducts();
  for (const product of products) {
    entries.push({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Retrieve active categories via Public DAL (inactive filtered automatically)
  const categories = await getCategories();
  for (const category of categories) {
    entries.push({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
