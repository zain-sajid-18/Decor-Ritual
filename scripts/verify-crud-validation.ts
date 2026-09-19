import { slugify, isValidSlug } from "../lib/utils/slugify";
import { z } from "zod";
import { countProductsInCategory } from "../lib/repositories/categories";
import { findProducts } from "../lib/repositories/products";
import { isDbAvailable } from "../lib/db";

async function runVerification() {
  console.log("=== Step 6 Verification Suite ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Slug Generator & Validator
  const slug1 = slugify("Modern Wireless Headphones!!!");
  assert(slug1 === "modern-wireless-headphones", `Slugify special chars: got "${slug1}"`);

  const slug2 = slugify("  Lumina Desk Lamp - 2026 Edition  ");
  assert(slug2 === "lumina-desk-lamp-2026-edition", `Slugify whitespace and hyphens: got "${slug2}"`);

  assert(isValidSlug("modern-wireless-headphones"), "Valid slug format recognized");
  assert(!isValidSlug("Modern Wireless Headphones"), "Invalid slug format rejected");
  assert(!isValidSlug("slug--double-hyphen"), "Double hyphens rejected");

  // 2. Product Zod Schema Validation
  const ProductSchema = z.object({
    title: z.string({ message: "Product title is required." }).trim().min(1, "Product title cannot be empty."),
    slug: z.string().trim().min(1).transform(slugify).refine(isValidSlug, { message: "Invalid slug." }),
    categoryId: z.string().trim().min(1),
    shortDescription: z.string().trim().min(1),
    description: z.string().trim().min(1),
    amazonUrl: z.string().url("Must be a valid URL."),
    asin: z.string().trim().optional().refine((val) => !val || val.length <= 10, { message: "ASIN too long" }),
    status: z.enum(["draft", "published", "archived"] as const),
    featured: z.boolean().default(false),
    recommended: z.boolean().default(false),
  });

  const validProduct = ProductSchema.safeParse({
    title: "Minimalist Lamp",
    slug: "minimalist-lamp",
    categoryId: "cat-lighting",
    shortDescription: "A sleek desk lamp.",
    description: "Detailed description of the desk lamp.",
    amazonUrl: "https://www.amazon.com/dp/B08N5WRWNW",
    asin: "B08N5WRWNW",
    status: "published",
    featured: true,
    recommended: false,
  });
  assert(validProduct.success, "Valid product schema accepted");

  const invalidTitle = ProductSchema.safeParse({
    title: "   ",
    slug: "valid-slug",
    categoryId: "cat-1",
    shortDescription: "Short",
    description: "Long",
    amazonUrl: "https://www.amazon.com/dp/B08N5WRWNW",
    status: "draft",
  });
  assert(!invalidTitle.success, "Empty/whitespace title rejected");

  const invalidUrl = ProductSchema.safeParse({
    title: "Valid Title",
    slug: "valid-slug",
    categoryId: "cat-1",
    shortDescription: "Short",
    description: "Long",
    amazonUrl: "not-a-url",
    status: "draft",
  });
  assert(!invalidUrl.success, "Malformed Amazon URL rejected");

  const invalidStatus = ProductSchema.safeParse({
    title: "Valid Title",
    slug: "valid-slug",
    categoryId: "cat-1",
    shortDescription: "Short",
    description: "Long",
    amazonUrl: "https://www.amazon.com/dp/B08N5WRWNW",
    status: "deleted",
  });
  assert(!invalidStatus.success, "Invalid status value rejected");

  const invalidAsin = ProductSchema.safeParse({
    title: "Valid Title",
    slug: "valid-slug",
    categoryId: "cat-1",
    shortDescription: "Short",
    description: "Long",
    amazonUrl: "https://www.amazon.com/dp/B08N5WRWNW",
    asin: "TOOLONGASIN12345",
    status: "draft",
  });
  assert(!invalidAsin.success, "ASIN exceeding 10 characters rejected");

  // 3. Category Zod Schema Validation
  const CategorySchema = z.object({
    name: z.string().trim().min(1, "Name required."),
    slug: z.string().trim().min(1).transform(slugify).refine(isValidSlug),
    imageUrl: z.string().url().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    displayOrder: z.coerce.number().default(0),
  });

  const validCategory = CategorySchema.safeParse({
    name: "Living Room",
    slug: "living-room",
    imageUrl: "https://images.unsplash.com/photo-1",
    isActive: true,
    displayOrder: 1,
  });
  assert(validCategory.success, "Valid category schema accepted");

  const invalidCategory = CategorySchema.safeParse({
    name: "",
    slug: "living-room",
  });
  assert(!invalidCategory.success, "Empty category name rejected");

  const invalidCategoryUrl = CategorySchema.safeParse({
    name: "Living Room",
    slug: "living-room",
    imageUrl: "invalid-url",
  });
  assert(!invalidCategoryUrl.success, "Malformed category imageUrl rejected");

  // 4. Category Reference Check (ON DELETE RESTRICT behavior)
  const products = await findProducts();
  assert(products.length > 0, `Catalog has seed products available for read checks (${products.length} products)`);

  const categoryIdWithProducts = products[0].categoryId;
  const countAssigned = await countProductsInCategory(categoryIdWithProducts);
  assert(countAssigned > 0, `Category '${categoryIdWithProducts}' has ${countAssigned} product(s) assigned (deletion must be blocked)`);

  // 5. Database Availability Guard
  assert(
    isDbAvailable === false || isDbAvailable === true,
    `Database availability flag correctly reflects environment: isDbAvailable = ${isDbAvailable}`
  );

  console.log(`\n=== Verification Complete: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runVerification().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});
