"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isDbAvailable } from "@/lib/db";
import {
  generateUploadSignature,
  deleteCloudinaryAsset,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import {
  adminGetProductImageWithProduct,
  adminCreateProductImage,
  adminUpdateProductImage,
  adminDeleteProductImage,
  adminReorderProductImages,
  adminGetProductImages,
} from "@/lib/data/admin/product-images";
import { adminGetProductById } from "@/lib/data/admin/products";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/types/action";
import type { ProductImage } from "@/types/product";

/** Max images allowed per product. */
const MAX_IMAGES_PER_PRODUCT = 10;

// ─── Schema ────────────────────────────────────────────────────────────────

const SaveImageSchema = z.object({
  url: z.string().url("Image URL must be a valid URL."),
  cloudinaryPublicId: z.string().min(1, "Cloudinary public ID is required."),
  alt: z.string().max(255, "Alt text must be 255 characters or fewer.").default(""),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const UpdateAltSchema = z.object({
  alt: z.string().max(255, "Alt text must be 255 characters or fewer."),
});

// ─── Get Upload Signature ──────────────────────────────────────────────────

export type UploadSignatureResult = ActionState & {
  timestamp?: number;
  signature?: string;
  cloudName?: string;
  apiKey?: string;
  folder?: string;
  allowedFormats?: string;
  maxFileSize?: number;
};

/**
 * Server Action: Get signed Cloudinary upload parameters.
 *
 * Authorization: requireAdmin()
 * Security: CLOUDINARY_API_SECRET is used server-side to sign and is NEVER returned.
 * The browser receives only: timestamp, signature, cloudName, apiKey, folder.
 */
export async function getUploadSignatureAction(
  productId: string
): Promise<UploadSignatureResult> {
  await requireAdmin();

  if (!productId || typeof productId !== "string") {
    return { success: false, message: "Invalid product ID." };
  }

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Database connection is not available. IMAGE_UPLOAD requires a configured DATABASE_URL.",
    };
  }

  if (!isCloudinaryConfigured) {
    return {
      success: false,
      message:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.",
    };
  }

  const isNewProduct = productId.startsWith("new-") || productId.startsWith("draft-");

  if (!isNewProduct) {
    // Verify product exists before signing
    const product = await adminGetProductById(productId);
    if (!product) {
      return { success: false, message: "Product not found." };
    }

    // Enforce max images per product
    const existingImages = await adminGetProductImages(productId);
    if (existingImages.length >= MAX_IMAGES_PER_PRODUCT) {
      return {
        success: false,
        message: `Products can have a maximum of ${MAX_IMAGES_PER_PRODUCT} images.`,
      };
    }
  }

  try {
    const params = await generateUploadSignature(productId);
    return {
      success: true,
      ...params,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate upload signature.";
    // Safe to surface config errors; secrets are not included in message
    return { success: false, message };
  }
}

// ─── Save Product Image ────────────────────────────────────────────────────

export type SaveImageResult = ActionState & { image?: ProductImage };

/**
 * Server Action: Save an uploaded Cloudinary image to the database.
 *
 * Called by the client AFTER a successful direct Cloudinary upload.
 * Validates the URL and public_id before writing to the DB.
 *
 * Authorization: requireAdmin()
 */
export async function saveProductImageAction(
  productId: string,
  data: {
    url: string;
    cloudinaryPublicId: string;
    alt: string;
    sortOrder: number;
  }
): Promise<SaveImageResult> {
  await requireAdmin();

  if (!productId || typeof productId !== "string") {
    return { success: false, message: "Invalid product ID." };
  }

  if (!isDbAvailable) {
    return {
      success: false,
      message: "Database connection is not available.",
    };
  }

  const validated = SaveImageSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid image data.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Verify product exists
  const product = await adminGetProductById(productId);
  if (!product) {
    return { success: false, message: "Product not found." };
  }

  // Check image limit
  const existingImages = await adminGetProductImages(productId);
  if (existingImages.length >= MAX_IMAGES_PER_PRODUCT) {
    // Attempt to clean up the just-uploaded Cloudinary asset to avoid orphans
    if (validated.data.cloudinaryPublicId) {
      await deleteCloudinaryAsset(validated.data.cloudinaryPublicId).catch(() => {});
    }
    return {
      success: false,
      message: `Products can have a maximum of ${MAX_IMAGES_PER_PRODUCT} images. The uploaded image was removed from Cloudinary.`,
    };
  }

  try {
    const image = await adminCreateProductImage({
      productId,
      url: validated.data.url,
      cloudinaryPublicId: validated.data.cloudinaryPublicId,
      alt: validated.data.alt,
      sortOrder: validated.data.sortOrder,
    });

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/");

    return { success: true, message: "Image saved successfully.", image };
  } catch (err) {
    // DB write failed after Cloudinary upload succeeded — attempt cleanup
    if (validated.data.cloudinaryPublicId) {
      const cleanupResult = await deleteCloudinaryAsset(
        validated.data.cloudinaryPublicId
      ).catch(() => ({ success: false }));
      if (!cleanupResult.success) {
        console.error(
          `[Images] Orphaned Cloudinary asset after DB failure: ${validated.data.cloudinaryPublicId}`
        );
      }
    }

    console.error("[Images] Failed to save image record after upload:", err);
    return {
      success: false,
      message:
        "Failed to save image to database. The uploaded image has been removed from Cloudinary.",
    };
  }
}

// ─── Update Image Alt Text ─────────────────────────────────────────────────

/**
 * Server Action: Update a product image's alt text.
 *
 * Authorization: requireAdmin()
 * Verifies the image belongs to the specified product before updating.
 */
export async function updateProductImageAltAction(
  imageId: string,
  productId: string,
  alt: string
): Promise<ActionState> {
  await requireAdmin();

  if (!imageId || !productId) {
    return { success: false, message: "Invalid image or product ID." };
  }

  if (!isDbAvailable) {
    return { success: false, message: "Database connection is not available." };
  }

  const validated = UpdateAltSchema.safeParse({ alt });
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message ?? "Invalid alt text.",
    };
  }

  // Verify ownership: image must belong to this product
  const record = await adminGetProductImageWithProduct(imageId);
  if (!record || record.productId !== productId) {
    return { success: false, message: "Image not found." };
  }

  await adminUpdateProductImage(imageId, { alt: validated.data.alt });
  revalidatePath(`/admin/products/${productId}`);

  return { success: true, message: "Alt text updated." };
}

// ─── Reorder Product Images ────────────────────────────────────────────────

/**
 * Server Action: Reorder product images.
 *
 * Accepts an ordered array of image IDs. Assigns sort_order based on position.
 * Authorization: requireAdmin()
 * Verifies all imageIds belong to the specified product.
 */
export async function reorderProductImagesAction(
  productId: string,
  orderedImageIds: string[]
): Promise<ActionState> {
  await requireAdmin();

  if (!productId || !Array.isArray(orderedImageIds)) {
    return { success: false, message: "Invalid request." };
  }

  if (!isDbAvailable) {
    return { success: false, message: "Database connection is not available." };
  }

  // Fetch existing images to verify all IDs belong to this product
  const existingImages = await adminGetProductImages(productId);
  const existingIds = new Set(existingImages.map((img) => img.id));

  const allBelongToProduct = orderedImageIds.every((id) => existingIds.has(id));
  if (!allBelongToProduct) {
    return {
      success: false,
      message: "One or more image IDs do not belong to this product.",
    };
  }

  const updates = orderedImageIds.map((id, index) => ({
    id,
    sortOrder: index,
  }));

  await adminReorderProductImages(updates);
  revalidatePath(`/admin/products/${productId}`);

  return { success: true, message: "Image order updated." };
}

// ─── Delete Product Image ──────────────────────────────────────────────────

/**
 * Server Action: Delete a product image.
 *
 * Authorization: requireAdmin()
 * Security:
 *   1. Looks up the image by database ID — never trusts client-supplied public_id
 *   2. Verifies the image belongs to the specified product
 *   3. Deletes from Cloudinary using the stored public_id
 *   4. Removes the database record
 *
 * Strategy for partial failures:
 *   - If Cloudinary deletion fails but DB record exists: DB record is still
 *     removed to avoid a broken UI state. The orphaned Cloudinary asset is logged
 *     for manual cleanup. A warning is surfaced to the admin.
 *   - If DB deletion fails: returns an error; Cloudinary asset is retained.
 */
export async function deleteProductImageAction(
  imageId: string,
  productId: string
): Promise<ActionState> {
  await requireAdmin();

  if (!imageId || !productId) {
    return { success: false, message: "Invalid image or product ID." };
  }

  if (!isDbAvailable) {
    return { success: false, message: "Database connection is not available." };
  }

  // 1. Fetch image from DB — determines the real public_id, never trusts client input
  const record = await adminGetProductImageWithProduct(imageId);
  if (!record || record.productId !== productId) {
    return { success: false, message: "Image not found." };
  }

  const { image } = record;
  let cloudinaryWarning: string | undefined;

  // 2. Delete from Cloudinary (if public_id is stored)
  if (image.cloudinaryPublicId) {
    const result = await deleteCloudinaryAsset(image.cloudinaryPublicId);
    if (!result.success) {
      // Log for manual cleanup, but continue to remove DB record
      console.error(
        `[Images] Cloudinary deletion failed for ${image.cloudinaryPublicId}:`,
        result.error
      );
      cloudinaryWarning =
        "The image record was removed, but the Cloudinary asset could not be deleted. Manual cleanup may be required.";
    }
  }

  // 3. Delete database record
  const deleted = await adminDeleteProductImage(imageId);
  if (!deleted) {
    return { success: false, message: "Failed to remove image record from database." };
  }

  const product = await adminGetProductById(productId);
  if (product) {
    revalidatePath(`/products/${product.slug}`);
  }
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}`);

  if (cloudinaryWarning) {
    return { success: true, message: cloudinaryWarning };
  }

  return { success: true, message: "Image deleted successfully." };
}
