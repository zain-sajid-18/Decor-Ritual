import { db } from "@/lib/db";
import { products, productImages, categories } from "@/lib/db/schema";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
  ProductImage,
  PaginatedProductsResult,
} from "@/types/product";
import { SEED_PRODUCTS, SEED_CATEGORIES } from "@/lib/db/seed-data";
import crypto from "crypto";

/**
 * Product Repository
 * Handles direct PostgreSQL execution via Drizzle ORM with null-safe development fallback.
 */

// ─── Mapping helper ────────────────────────────────────────────────────────

function mapDbImage(img: {
  id: string;
  url: string;
  cloudinaryPublicId: string | null;
  alt: string;
  sortOrder: number;
}): ProductImage {
  return {
    id: img.id,
    url: img.url,
    cloudinaryPublicId: img.cloudinaryPublicId ?? undefined,
    alt: img.alt,
    sortOrder: img.sortOrder,
  };
}

// ─── Product Queries ───────────────────────────────────────────────────────

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
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.shortDescription || "").toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (params.sort === "a-z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (params.sort === "featured") {
      result.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
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
    const term = `%${params.search.trim()}%`;
    conditions.push(
      sql`(${products.title} ILIKE ${term} OR ${products.shortDescription} ILIKE ${term} OR (${products.brand} IS NOT NULL AND ${products.brand} ILIKE ${term}) OR array_to_string(${products.tags}, ' ') ILIKE ${term})`
    );
  }

  let orderByClause = [desc(products.createdAt)];
  if (params.sort === "newest") {
    orderByClause = [desc(products.createdAt)];
  } else if (params.sort === "a-z") {
    orderByClause = [asc(products.title)];
  } else if (params.sort === "featured") {
    orderByClause = [desc(products.featured), desc(products.createdAt)];
  }

  const rows = await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: orderByClause,
    limit: params.limit,
    offset: params.offset,
    with: {
      category: true,
      images: {
        orderBy: [asc(productImages.sortOrder)],
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
    images: r.images.map(mapDbImage),
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

export async function findProductsWithPagination(
  params: ProductQueryParams & { page?: number; pageSize?: number } = {}
): Promise<PaginatedProductsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 12));
  const offset = (page - 1) * pageSize;

  if (!db) {
    let result = [...SEED_PRODUCTS];

    if (params.status) {
      result = result.filter((p) => p.status === params.status);
    }
    if (params.categorySlug) {
      const activeCat = SEED_CATEGORIES.find(
        (c) => c.slug === params.categorySlug && c.isActive
      );
      if (!activeCat) {
        return { products: [], totalCount: 0, page, totalPages: 1, pageSize };
      }
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
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.shortDescription || "").toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (params.sort === "a-z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: featured first, then newest
      result.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    const totalCount = result.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paginatedProducts = result.slice(offset, offset + pageSize);

    return {
      products: paginatedProducts,
      totalCount,
      page,
      totalPages,
      pageSize,
    };
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

  if (params.categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: and(eq(categories.slug, params.categorySlug), eq(categories.isActive, true)),
    });
    if (!cat) {
      return { products: [], totalCount: 0, page, totalPages: 1, pageSize };
    }
    conditions.push(eq(products.categoryId, cat.id));
  }

  if (params.search) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      sql`(${products.title} ILIKE ${term} OR ${products.shortDescription} ILIKE ${term} OR (${products.brand} IS NOT NULL AND ${products.brand} ILIKE ${term}) OR array_to_string(${products.tags}, ' ') ILIKE ${term})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Count query
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(whereClause);
  const totalCount = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  let orderByClause = [desc(products.featured), desc(products.createdAt)];
  if (params.sort === "newest") {
    orderByClause = [desc(products.createdAt)];
  } else if (params.sort === "a-z") {
    orderByClause = [asc(products.title)];
  } else if (params.sort === "featured") {
    orderByClause = [desc(products.featured), desc(products.createdAt)];
  }

  const rows = await db.query.products.findMany({
    where: whereClause,
    orderBy: orderByClause,
    limit: pageSize,
    offset,
    with: {
      category: true,
      images: {
        orderBy: [asc(productImages.sortOrder)],
      },
    },
  });

  const mappedProducts: Product[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    brand: r.brand ?? undefined,
    shortDescription: r.shortDescription,
    description: r.description,
    categoryId: r.categoryId,
    categorySlug: r.category?.slug,
    tags: r.tags,
    images: r.images.map(mapDbImage),
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

  return {
    products: mappedProducts,
    totalCount,
    page,
    totalPages,
    pageSize,
  };
}

export async function findProductById(id: string): Promise<Product | null> {
  if (!db) {
    return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  }

  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      images: {
        orderBy: [asc(productImages.sortOrder)],
      },
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
    images: row.images.map(mapDbImage),
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
      images: {
        orderBy: [asc(productImages.sortOrder)],
      },
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
    images: row.images.map(mapDbImage),
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
  if (!db) {
    throw new Error(
      "Database connection is not available. Real mutations require a configured DATABASE_URL."
    );
  }

  const id = `prod-${Date.now()}`;
  const now = new Date();

  const [row] = await db
    .insert(products)
    .values({
      id,
      title: data.title,
      slug: data.slug,
      brand: data.brand,
      shortDescription: data.shortDescription ?? "",
      description: data.description ?? "",
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
      cloudinaryPublicId: img.cloudinaryPublicId ?? null,
      alt: img.alt,
      sortOrder: img.sortOrder ?? index,
      createdAt: now,
    }));
    const createdImages = await db.insert(productImages).values(imgValues).returning();
    insertedImages = createdImages.map(mapDbImage);
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
  if (!db) {
    throw new Error(
      "Database connection is not available. Real mutations require a configured DATABASE_URL."
    );
  }

  const now = new Date();

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
    throw new Error(
      "Database connection is not available. Real mutations require a configured DATABASE_URL."
    );
  }

  const result = await db.delete(products).where(eq(products.id, id)).returning();
  return result.length > 0;
}

// ─── Product Image Queries ─────────────────────────────────────────────────

/**
 * Find a single product image record by its ID.
 */
export async function findProductImageById(imageId: string): Promise<ProductImage | null> {
  if (!db) return null;

  const row = await db.query.productImages.findFirst({
    where: eq(productImages.id, imageId),
  });

  return row ? mapDbImage(row) : null;
}

/**
 * Find a product image record with its product relationship for ownership verification.
 */
export async function findProductImageWithProduct(
  imageId: string
): Promise<{ image: ProductImage; productId: string } | null> {
  if (!db) return null;

  const row = await db.query.productImages.findFirst({
    where: eq(productImages.id, imageId),
  });

  if (!row) return null;

  return {
    image: mapDbImage(row),
    productId: row.productId,
  };
}

/**
 * Find all images for a product ordered by sort_order ascending.
 */
export async function findProductImages(productId: string): Promise<ProductImage[]> {
  if (!db) return [];

  const rows = await db.query.productImages.findMany({
    where: eq(productImages.productId, productId),
    orderBy: [asc(productImages.sortOrder)],
  });

  return rows.map(mapDbImage);
}

export interface InsertProductImageData {
  productId: string;
  url: string;
  cloudinaryPublicId?: string;
  alt: string;
  sortOrder: number;
}

/**
 * Insert a single product image record after a successful Cloudinary upload.
 */
export async function insertProductImage(
  data: InsertProductImageData
): Promise<ProductImage> {
  if (!db) {
    throw new Error(
      "Database connection is not available. Real mutations require a configured DATABASE_URL."
    );
  }

  const id = `img-${crypto.randomBytes(6).toString("hex")}`;

  const [row] = await db
    .insert(productImages)
    .values({
      id,
      productId: data.productId,
      url: data.url,
      cloudinaryPublicId: data.cloudinaryPublicId ?? null,
      alt: data.alt,
      sortOrder: data.sortOrder,
      createdAt: new Date(),
    })
    .returning();

  return mapDbImage(row);
}

export interface UpdateProductImageData {
  alt?: string;
  sortOrder?: number;
}

/**
 * Update a product image's alt text or sort order.
 */
export async function updateProductImageById(
  imageId: string,
  data: UpdateProductImageData
): Promise<ProductImage | null> {
  if (!db) {
    throw new Error(
      "Database connection is not available. Real mutations require a configured DATABASE_URL."
    );
  }

  const [row] = await db
    .update(productImages)
    .set({
      ...(data.alt !== undefined ? { alt: data.alt } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    })
    .where(eq(productImages.id, imageId))
    .returning();

  return row ? mapDbImage(row) : null;
}

/**
 * Delete a single product image record from the database.
 */
export async function deleteProductImageById(imageId: string): Promise<boolean> {
  if (!db) {
    throw new Error(
      "Database connection is not available. Real mutations require a configured DATABASE_URL."
    );
  }

  const result = await db
    .delete(productImages)
    .where(eq(productImages.id, imageId))
    .returning();

  return result.length > 0;
}

/**
 * Batch update sort orders for a product's images.
 * Used when the admin reorders images.
 */
export async function updateProductImageSortOrders(
  updates: { id: string; sortOrder: number }[]
): Promise<void> {
  if (!db) {
    throw new Error(
      "Database connection is not available. Real mutations require a configured DATABASE_URL."
    );
  }

  await Promise.all(
    updates.map(({ id, sortOrder }) =>
      db!
        .update(productImages)
        .set({ sortOrder })
        .where(eq(productImages.id, id))
    )
  );
}
