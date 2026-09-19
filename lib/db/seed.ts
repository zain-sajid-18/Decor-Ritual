import { db } from "./index";
import { categories, products, productImages } from "./schema";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "./seed-data";

/**
 * Seed runner for development database initialization.
 * Only executes when a live database connection is established.
 */
export async function seedDatabase() {
  if (!db) {
    console.warn("DATABASE_URL is not configured. Database seeding aborted.");
    return false;
  }

  console.log("Seeding development database with initial fixtures...");

  for (const cat of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        isActive: cat.isActive,
        displayOrder: cat.displayOrder,
        seoTitle: cat.seo?.title,
        seoDescription: cat.seo?.description,
      })
      .onConflictDoNothing();
  }

  for (const prod of SEED_PRODUCTS) {
    await db
      .insert(products)
      .values({
        id: prod.id,
        title: prod.title,
        slug: prod.slug,
        brand: prod.brand,
        shortDescription: prod.shortDescription,
        description: prod.description,
        categoryId: prod.categoryId,
        tags: prod.tags,
        status: prod.status,
        featured: prod.featured,
        recommended: prod.recommended,
        amazonUrl: prod.amazonUrl,
        asin: prod.asin,
        seoTitle: prod.seo?.title,
        seoDescription: prod.seo?.description,
      })
      .onConflictDoNothing();

    for (const img of prod.images) {
      await db
        .insert(productImages)
        .values({
          id: img.id,
          productId: prod.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
        })
        .onConflictDoNothing();
    }
  }

  console.log("Development database seeding complete.");
  return true;
}
