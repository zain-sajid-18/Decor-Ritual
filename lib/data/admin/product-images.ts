import {
  findProductImageById,
  findProductImageWithProduct,
  findProductImages,
  insertProductImage,
  updateProductImageById,
  deleteProductImageById,
  updateProductImageSortOrders,
  type InsertProductImageData,
  type UpdateProductImageData,
} from "@/lib/repositories/products";
import type { ProductImage } from "@/types/product";

/**
 * Admin Data Access Layer: Product Images
 *
 * Isolated from the main product DAL.
 * Used exclusively by image management Server Actions.
 *
 * Authorization is enforced at the Server Action layer (requireAdmin()),
 * not here. These functions assume authorization has already been verified.
 */

/**
 * Get a single product image by its database ID.
 */
export async function adminGetProductImage(
  imageId: string
): Promise<ProductImage | null> {
  return findProductImageById(imageId);
}

/**
 * Get a product image with its owning product ID for ownership verification.
 */
export async function adminGetProductImageWithProduct(
  imageId: string
): Promise<{ image: ProductImage; productId: string } | null> {
  return findProductImageWithProduct(imageId);
}

/**
 * Get all images for a product ordered by sort_order ascending.
 */
export async function adminGetProductImages(
  productId: string
): Promise<ProductImage[]> {
  return findProductImages(productId);
}

/**
 * Create a new product image record after a successful Cloudinary upload.
 */
export async function adminCreateProductImage(
  data: InsertProductImageData
): Promise<ProductImage> {
  return insertProductImage(data);
}

/**
 * Update a product image's alt text and/or sort order.
 */
export async function adminUpdateProductImage(
  imageId: string,
  data: UpdateProductImageData
): Promise<ProductImage | null> {
  return updateProductImageById(imageId, data);
}

/**
 * Delete a product image database record.
 * Caller is responsible for deleting the Cloudinary asset separately.
 */
export async function adminDeleteProductImage(imageId: string): Promise<boolean> {
  return deleteProductImageById(imageId);
}

/**
 * Batch update sort orders for a product's images.
 */
export async function adminReorderProductImages(
  updates: { id: string; sortOrder: number }[]
): Promise<void> {
  return updateProductImageSortOrders(updates);
}
