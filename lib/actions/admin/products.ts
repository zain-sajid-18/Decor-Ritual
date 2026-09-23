"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isDbAvailable } from "@/lib/db";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetProductById,
  adminGetProductBySlug,
  adminPublishProduct,
  adminUnpublishProduct,
  adminArchiveProduct,
} from "@/lib/data/admin/products";
import { slugify, isValidSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteCloudinaryAssets, isCloudinaryConfigured } from "@/lib/cloudinary";
import { isValidAmazonUrl } from "@/lib/amazon/domains";
import type { ActionState } from "@/types/action";
import type { CreateProductInput, UpdateProductInput } from "@/types/product";

/**
 * Check if an error is Next.js's internal redirect signal.
 */
function isNextRedirect(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("digest" in error && typeof (error as { digest?: string }).digest === "string") {
    return (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");
  }
  return (error as Error).message === "NEXT_REDIRECT";
}

/**
 * Product Validation Schema
 */
const ProductFormSchema = z.object({
  title: z
    .string({ message: "Product title is required." })
    .trim()
    .min(1, "Product title cannot be empty."),
  slug: z
    .string({ message: "Slug is required." })
    .trim()
    .min(1, "Slug cannot be empty.")
    .transform((val) => slugify(val))
    .refine((val) => isValidSlug(val), {
      message: "Slug must contain only lowercase letters, numbers, and hyphens.",
    }),
  brand: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  categoryId: z
    .string({ message: "Category is required." })
    .trim()
    .min(1, "Please select a category."),
  shortDescription: z
    .string({ message: "Short description is required." })
    .trim()
    .min(1, "Short description cannot be empty."),
  description: z
    .string({ message: "Full description is required." })
    .trim()
    .min(1, "Full description cannot be empty."),
  tags: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return [];
      return val
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }),
  amazonUrl: z
    .string({ message: "Amazon URL is required." })
    .trim()
    .min(1, "Amazon URL is required.")
    .url("Amazon URL must be a valid URL.")
    .refine((url) => isValidAmazonUrl(url), {
      message:
        "URL must be a valid Amazon product URL (e.g., https://www.amazon.com/dp/... or https://amzn.to/...).",
    }),
  asin: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val.toUpperCase() : undefined))
    .refine((val) => !val || val.length <= 10, {
      message: "ASIN must be 10 characters or fewer.",
    }),
  status: z.enum(["draft", "published", "archived"] as const, {
    message: "Status must be draft, published, or archived.",
  }),
  featured: z.boolean().default(false),
  recommended: z.boolean().default(false),
  seoTitle: z
    .string()
    .trim()
    .max(70, "SEO title must be 70 characters or fewer.")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  seoDescription: z
    .string()
    .trim()
    .max(160, "SEO description must be 160 characters or fewer.")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

/**
 * Helper to parse raw FormData into a normalized object.
 */
function parseProductFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    brand: formData.get("brand") || undefined,
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    tags: formData.get("tags") || "",
    amazonUrl: formData.get("amazonUrl"),
    asin: formData.get("asin") || undefined,
    status: formData.get("status") || "draft",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    recommended: formData.get("recommended") === "on" || formData.get("recommended") === "true",
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
  };
}

/**
 * Server Action: Create Product
 */
export async function createProductAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Database connection is not available. Real mutations require a configured DATABASE_URL.",
    };
  }

  const rawData = parseProductFormData(formData);
  const validated = ProductFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the errors in the form.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  // Verify slug uniqueness
  try {
    const existing = await adminGetProductBySlug(data.slug);
    if (existing) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        errors: {
          slug: ["A product with this slug already exists."],
        },
      };
    }

    const input: CreateProductInput = {
      title: data.title,
      slug: data.slug,
      brand: data.brand,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription,
      description: data.description,
      tags: data.tags,
      amazonUrl: data.amazonUrl,
      asin: data.asin,
      status: data.status,
      featured: data.featured,
      recommended: data.recommended,
      seo:
        data.seoTitle || data.seoDescription
          ? { title: data.seoTitle, description: data.seoDescription }
          : undefined,
    };

    await adminCreateProduct(input);
  } catch (error) {
    if (isNextRedirect(error)) throw error;

    const errMsg = (error as Error)?.message || "";
    if (errMsg.includes("unique") || errMsg.includes("23505")) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        errors: {
          slug: ["A product with this slug already exists."],
        },
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while creating the product.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

/**
 * Server Action: Update Product
 */
export async function updateProductAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return {
      success: false,
      message: "Invalid product ID provided.",
    };
  }

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Database connection is not available. Real mutations require a configured DATABASE_URL.",
    };
  }

  const existingProduct = await adminGetProductById(id);
  if (!existingProduct) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  const rawData = parseProductFormData(formData);
  const validated = ProductFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the errors in the form.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  // Check if slug is taken by another product
  try {
    const productWithSlug = await adminGetProductBySlug(data.slug);
    if (productWithSlug && productWithSlug.id !== id) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        errors: {
          slug: ["A product with this slug already exists."],
        },
      };
    }

    const input: UpdateProductInput = {
      title: data.title,
      slug: data.slug,
      brand: data.brand,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription,
      description: data.description,
      tags: data.tags,
      amazonUrl: data.amazonUrl,
      asin: data.asin,
      status: data.status,
      featured: data.featured,
      recommended: data.recommended,
      seo:
        data.seoTitle || data.seoDescription
          ? { title: data.seoTitle, description: data.seoDescription }
          : undefined,
    };

    await adminUpdateProduct(id, input);
  } catch (error) {
    if (isNextRedirect(error)) throw error;

    const errMsg = (error as Error)?.message || "";
    if (errMsg.includes("unique") || errMsg.includes("23505")) {
      return {
        success: false,
        message: "A product with this slug already exists.",
        errors: {
          slug: ["A product with this slug already exists."],
        },
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while updating the product.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products/${data.slug}`);
  if (existingProduct.slug !== data.slug) {
    revalidatePath(`/products/${existingProduct.slug}`);
  }

  redirect("/admin/products");
}

/**
 * Server Action: Delete Product
 * Cleans up Cloudinary assets before removing the product from the database.
 */
export async function deleteProductAction(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return {
      success: false,
      message: "Invalid product ID provided.",
    };
  }

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Database connection is not available. Real mutations require a configured DATABASE_URL.",
    };
  }

  try {
    const existing = await adminGetProductById(id);
    if (!existing) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    // 1. Clean up Cloudinary assets before DB deletion
    //    Only attempted if Cloudinary is configured and images have public IDs.
    if (isCloudinaryConfigured && existing.images.length > 0) {
      const publicIds = existing.images
        .map((img) => img.cloudinaryPublicId)
        .filter((id): id is string => Boolean(id));

      if (publicIds.length > 0) {
        const results = await deleteCloudinaryAssets(publicIds);
        const failures = results.filter((r) => !r.success);
        if (failures.length > 0) {
          console.error(
            `[Products] Failed to delete ${failures.length} Cloudinary asset(s) during product deletion:`,
            failures.map((f) => f.publicId)
          );
          // Continue with DB deletion — DB cascade will remove image records.
          // Cloudinary orphans are logged for manual cleanup.
        }
      }
    }

    // 2. Delete product from DB (cascade removes product_images records)
    const deleted = await adminDeleteProduct(id);
    if (!deleted) {
      return {
        success: false,
        message: "Failed to delete product.",
      };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/products/${existing.slug}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;

    return {
      success: false,
      message: "An error occurred while deleting the product.",
    };
  }

  redirect("/admin/products");
}

/**
 * Server Action: Publish Product
 */
export async function publishProductAction(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!isDbAvailable) {
    return {
      success: false,
      message: "Database connection is not available.",
    };
  }

  try {
    const updated = await adminPublishProduct(id);
    if (!updated) return { success: false, message: "Product not found." };

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/products/${updated.slug}`);
    return { success: true, message: "Product published successfully." };
  } catch {
    return { success: false, message: "Failed to publish product." };
  }
}

/**
 * Server Action: Archive Product
 */
export async function archiveProductAction(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!isDbAvailable) {
    return {
      success: false,
      message: "Database connection is not available.",
    };
  }

  try {
    const updated = await adminArchiveProduct(id);
    if (!updated) return { success: false, message: "Product not found." };

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/products/${updated.slug}`);
    return { success: true, message: "Product archived successfully." };
  } catch {
    return { success: false, message: "Failed to archive product." };
  }
}

/**
 * Server Action: Unpublish (draft) Product
 */
export async function unpublishProductAction(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!isDbAvailable) {
    return {
      success: false,
      message: "Database connection is not available.",
    };
  }

  try {
    const updated = await adminUnpublishProduct(id);
    if (!updated) return { success: false, message: "Product not found." };

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/products/${updated.slug}`);
    return { success: true, message: "Product reverted to draft." };
  } catch {
    return { success: false, message: "Failed to unpublish product." };
  }
}
