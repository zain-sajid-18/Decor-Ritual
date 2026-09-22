import { findProducts, findProductBySlug, findProductsWithPagination } from "@/lib/repositories/products";
import type { Product, ProductQueryParams, ProductSortOption, PaginatedProductsResult } from "@/types/product";
import { getCategoryBySlug } from "@/lib/data/categories";

/**
 * Public Data Access Layer: Products
 * Strictly enforces that public shoppers only see published products and active categories.
 */

export async function getPaginatedProducts(options: {
  search?: string;
  categorySlug?: string;
  sort?: ProductSortOption;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedProductsResult> {
  return findProductsWithPagination({
    status: "published",
    search: options.search,
    categorySlug: options.categorySlug,
    sort: options.sort || "featured",
    page: options.page || 1,
    pageSize: options.pageSize || 12,
  });
}

export async function getProducts(
  params: Omit<ProductQueryParams, "status"> = {}
): Promise<Product[]> {
  return findProducts({
    ...params,
    status: "published",
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await findProductBySlug(slug);
  if (!product || product.status !== "published") {
    return null;
  }
  if (product.categorySlug) {
    const category = await getCategoryBySlug(product.categorySlug);
    if (!category || !category.isActive) {
      return null;
    }
  }
  return product;
}

export async function getProductsByCategory(
  categorySlug: string,
  limit?: number
): Promise<Product[]> {
  return findProducts({
    categorySlug,
    status: "published",
    limit,
  });
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return findProducts({
    status: "published",
    featured: true,
    limit,
  });
}

export async function getRecommendedProducts(limit = 6): Promise<Product[]> {
  return findProducts({
    status: "published",
    recommended: true,
    limit,
  });
}

export async function searchProducts(
  query: string,
  filters: { categorySlug?: string; tag?: string; limit?: number } = {}
): Promise<Product[]> {
  return findProducts({
    search: query,
    categorySlug: filters.categorySlug,
    tag: filters.tag,
    status: "published",
    limit: filters.limit,
  });
}
