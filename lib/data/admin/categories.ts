import {
  findCategories,
  findCategoryById,
  findCategoryBySlug,
  insertCategory,
  updateCategoryById,
  deleteCategoryById,
} from "@/lib/repositories/categories";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

/**
 * Admin Data Access Layer: Categories
 * Exposes taxonomy management for store administrators.
 */

export async function adminGetCategories(): Promise<Category[]> {
  return findCategories();
}

export async function adminGetCategoryById(id: string): Promise<Category | null> {
  return findCategoryById(id);
}

export async function adminGetCategoryBySlug(slug: string): Promise<Category | null> {
  return findCategoryBySlug(slug);
}

export async function adminCreateCategory(data: CreateCategoryInput): Promise<Category> {
  return insertCategory(data);
}

export async function adminUpdateCategory(
  id: string,
  data: UpdateCategoryInput
): Promise<Category | null> {
  return updateCategoryById(id, data);
}

export async function adminDeleteCategory(id: string): Promise<boolean> {
  return deleteCategoryById(id);
}
