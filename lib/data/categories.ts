import { findCategories, findCategoryBySlug } from "@/lib/repositories/categories";
import type { Category } from "@/types/category";

/**
 * Public Data Access Layer: Categories
 * Strictly enforces that public shoppers only see active categories.
 */

export async function getCategories(): Promise<Category[]> {
  const all = await findCategories();
  return all.filter((c) => c.isActive);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cat = await findCategoryBySlug(slug);
  if (!cat || !cat.isActive) {
    return null;
  }
  return cat;
}
