import { db } from "@/lib/db";
import { products, productImages, categories } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { Product, CreateProductInput, UpdateProductInput, ProductQueryParams } from "@/types/product";
import { SEED_PRODUCTS, SEED_CATEGORIES } from "@/lib/db/seed-data";

/**
 * Product Repository
 * Handles direct PostgreSQL execution via Drizzle ORM with null-safe development fallback.
 */

export async function findProducts(params: ProductQueryParams = {}): Promise<Product[]> {
  if (!db) {
    let result = [...SEED_PRODUCTS];

    if (params.status) {
      result = result.filter((p) => p.status === params.status);
    }
    if (params.categorySlug) {
      result = result.filter((p) => p.categorySlug === params.categorySlug);
    }
    if (params.categoryId) {
      result = result.filter((p) => p.categoryId === params.categoryId);
    }
    if (params.featured !== undefined) {
      result = result.filter((p) => p.featured === params.featured);
    }
    if (params.recommended !== undefined) {
      result = result.filter((p) => p.recommended === params.recommended);
    }
    if (params.tag) {
      result = result.filter((p) => p.tags.includes(params.tag!));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.offset) {
      result = result.slice(params.offset);
    }
    if (params.limit) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  const conditions = [];

  if (params.status) {
    conditions.push(eq(products.status, params.status));
  }
  if (params.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId));
  }
  if (params.featured !== undefined) {
    conditions.push(eq(products.featured, params.featured));
  }
  if (params.recommended !== undefined) {
    conditions.push(eq(products.recommended, params.recommended));
  }

  // If categorySlug is specified, join with categories table
  if (params.categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, params.categorySlug),
    });
    if (!cat) return [];
    conditions.push(eq(products.categoryId, cat.id));
  }

  if (params.search) {
    const term = `%${params.search}%`;
    conditions.push(
      sql`(${products.title} ILIKE ${term} OR ${products.shortDescription} ILIKE ${term})`
    );
  }

  const rows = await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(products.createdAt)],
    limit: params.limit,
    offset: params.offset,
    with: {
      category: true,
      images: {
        orderBy: [products.createdAt],
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    brand: r.brand ?? undefined,
    shortDescription: r.shortDescription,
    description: r.description,
    categoryId: r.categoryId,
    categorySlug: r.category?.slug,
    tags: r.tags,
    images: r.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
    featured: r.featured,
    recommended: r.recommended,
    status: r.status as Product["status"],
    amazonUrl: r.amazonUrl,
    asin: r.asin ?? undefined,
    seo:
      r.seoTitle || r.seoDescription
        ? { title: r.seoTitle ?? undefined, description: r.seoDescription ?? undefined }
        : undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function findProductById(id: string): Promise<Product | null> {
  if (!db) {
    return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  }

  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      images: true,
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    brand: row.brand ?? undefined,
    shortDescription: row.shortDescription,
    description: row.description,
    categoryId: row.categoryId,
    categorySlug: row.category?.slug,
    tags: row.tags,
    images: row.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
    featured: row.featured,
    recommended: row.recommended,
    status: row.status as Product["status"],
    amazonUrl: row.amazonUrl,
    asin: row.asin ?? undefined,
    seo:
      row.seoTitle || row.seoDescription
        ? { title: row.seoTitle ?? undefined, description: row.seoDescription ?? undefined }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function findProductBySlug(slug: string): Promise<Product | null> {
  if (!db) {
    return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      category: true,
      images: true,
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    brand: row.brand ?? undefined,
    shortDescription: row.shortDescription,
    description: row.description,
    categoryId: row.categoryId,
    categorySlug: row.category?.slug,
    tags: row.tags,
    images: row.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
    featured: row.featured,
    recommended: row.recommended,
    status: row.status as Product["status"],
    amazonUrl: row.amazonUrl,
    asin: row.asin ?? undefined,
    seo:
      row.seoTitle || row.seoDescription
        ? { title: row.seoTitle ?? undefined, description: row.seoDescription ?? undefined }
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function insertProduct(data: CreateProductInput): Promise<Product> {
  const id = `prod-${Date.now()}`;
  const now = new Date();

  if (!db) {
    const cat = SEED_CATEGORIES.find((c) => c.id === data.categoryId);
    const newProd: Product = {
      id,
      title: data.title,
      slug: data.slug,
      brand: data.brand,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId,
      categorySlug: cat?.slug,
      tags: data.tags,
      images: (data.images || []).map((img, i) => ({
        id: `img-${Date.now()}-${i}`,
        ...img,
      })),
      featured: data.featured ?? false,
      recommended: data.recommended ?? false,
      status: data.status ?? "draft",
      amazonUrl: data.amazonUrl,
      asin: data.asin,
      seo: data.seo,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    SEED_PRODUCTS.unshift(newProd);
    return newProd;
  }

  const [row] = await db
    .insert(products)
    .values({
      id,
      title: data.title,
      slug: data.slug,
      brand: data.brand,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId,
      tags: data.tags,
      featured: data.featured ?? false,
      recommended: data.recommended ?? false,
      status: data.status ?? "draft",
      amazonUrl: data.amazonUrl,
      asin: data.asin,
      seoTitle: data.seo?.title,
      seoDescription: data.seo?.description,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  let insertedImages: Product["images"] = [];
  if (data.images && data.images.length > 0) {
    const imgValues = data.images.map((img, index) => ({
      id: `img-${Date.now()}-${index}`,
      productId: id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder ?? index,
      createdAt: now,
    }));
    const createdImages = await db.insert(productImages).values(imgValues).returning();
    insertedImages = createdImages.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    }));
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    brand: row.brand ?? undefined,
    shortDescription: row.shortDescription,
    description: row.description,
    categoryId: row.categoryId,
    tags: row.tags,
    images: insertedImages,
    featured: row.featured,
    recommended: row.recommended,
    status: row.status as Product["status"],
    amazonUrl: row.amazonUrl,
    asin: row.asin ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateProductById(
  id: string,
  data: UpdateProductInput
): Promise<Product | null> {
  const now = new Date();

  if (!db) {
    const idx = SEED_PRODUCTS.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = SEED_PRODUCTS[idx];
    const updatedImages = data.images
      ? data.images.map((img, i) => ({
          id: `img-${id}-${i}`,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder ?? i,
        }))
      : current.images;

    const updated: Product = {
      ...current,
      ...data,
      images: updatedImages,
      updatedAt: now.toISOString(),
    };
    SEED_PRODUCTS[idx] = updated;
    return updated;
  }

  const [row] = await db
    .update(products)
    .set({
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.brand !== undefined ? { brand: data.brand } : {}),
      ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
      ...(data.recommended !== undefined ? { recommended: data.recommended } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.amazonUrl !== undefined ? { amazonUrl: data.amazonUrl } : {}),
      ...(data.asin !== undefined ? { asin: data.asin } : {}),
      ...(data.seo?.title !== undefined ? { seoTitle: data.seo.title } : {}),
      ...(data.seo?.description !== undefined ? { seoDescription: data.seo.description } : {}),
      updatedAt: now,
    })
    .where(eq(products.id, id))
    .returning();

  if (!row) return null;

  return findProductBySlug(row.slug);
}

export async function deleteProductById(id: string): Promise<boolean> {
  if (!db) {
    const idx = SEED_PRODUCTS.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    SEED_PRODUCTS.splice(idx, 1);
    return true;
  }

  const result = await db.delete(products).where(eq(products.id, id)).returning();
  return result.length > 0;
}
