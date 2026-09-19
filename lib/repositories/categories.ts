import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";
import { SEED_CATEGORIES } from "@/lib/db/seed-data";

/**
 * Category Repository
 * Mediates direct database interaction for categories with development fixture fallback.
 */

export async function findCategories(): Promise<Category[]> {
  if (!db) {
    return [...SEED_CATEGORIES];
  }

  const rows = await db.query.categories.findMany({
    orderBy: [asc(categories.displayOrder)],
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? undefined,
    image: r.image ?? undefined,
    isActive: r.isActive,
    displayOrder: r.displayOrder,
    seo:
      r.seoTitle || r.seoDescription
        ? { title: r.seoTitle ?? undefined, description: r.seoDescription ?? undefined }
        : undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  if (!db) {
    return SEED_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }

  const row = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    seo:
      row.seoTitle || row.seoDescription
        ? { title: row.seoTitle ?? undefined, description: row.seoDescription ?? undefined }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function findCategoryById(id: string): Promise<Category | null> {
  if (!db) {
    return SEED_CATEGORIES.find((c) => c.id === id) ?? null;
  }

  const row = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    seo:
      row.seoTitle || row.seoDescription
        ? { title: row.seoTitle ?? undefined, description: row.seoDescription ?? undefined }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function insertCategory(data: CreateCategoryInput): Promise<Category> {
  const id = `cat-${Date.now()}`;
  const now = new Date();

  if (!db) {
    const newCat: Category = {
      id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? 0,
      seo: data.seo,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    SEED_CATEGORIES.push(newCat);
    return newCat;
  }

  const [row] = await db
    .insert(categories)
    .values({
      id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? 0,
      seoTitle: data.seo?.title,
      seoDescription: data.seo?.description,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    seo:
      row.seoTitle || row.seoDescription
        ? { title: row.seoTitle ?? undefined, description: row.seoDescription ?? undefined }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateCategoryById(
  id: string,
  data: UpdateCategoryInput
): Promise<Category | null> {
  const now = new Date();

  if (!db) {
    const idx = SEED_CATEGORIES.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const current = SEED_CATEGORIES[idx];
    const updated: Category = {
      ...current,
      ...data,
      updatedAt: now.toISOString(),
    };
    SEED_CATEGORIES[idx] = updated;
    return updated;
  }

  const [row] = await db
    .update(categories)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.seo?.title !== undefined ? { seoTitle: data.seo.title } : {}),
      ...(data.seo?.description !== undefined ? { seoDescription: data.seo.description } : {}),
      updatedAt: now,
    })
    .where(eq(categories.id, id))
    .returning();

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    seo:
      row.seoTitle || row.seoDescription
        ? { title: row.seoTitle ?? undefined, description: row.seoDescription ?? undefined }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteCategoryById(id: string): Promise<boolean> {
  if (!db) {
    const idx = SEED_CATEGORIES.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    SEED_CATEGORIES.splice(idx, 1);
    return true;
  }

  const result = await db.delete(categories).where(eq(categories.id, id)).returning();
  return result.length > 0;
}
