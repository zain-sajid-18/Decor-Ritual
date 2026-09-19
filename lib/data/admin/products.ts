import {
  findProducts,
  findProductById,
  findProductBySlug,
  insertProduct,
  updateProductById,
  deleteProductById,
} from "@/lib/repositories/products";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
} from "@/types/product";

/**
 * Admin Data Access Layer: Products
 * Exposes full catalog lifecycle management (draft, published, archived).
 */

export async function adminGetProducts(params: ProductQueryParams = {}): Promise<Product[]> {
  return findProducts(params);
}

export async function adminGetProductById(id: string): Promise<Product | null> {
  return findProductById(id);
}

export async function adminGetProductBySlug(slug: string): Promise<Product | null> {
  return findProductBySlug(slug);
}

export async function adminCreateProduct(data: CreateProductInput): Promise<Product> {
  return insertProduct(data);
}

export async function adminUpdateProduct(
  id: string,
  data: UpdateProductInput
): Promise<Product | null> {
  return updateProductById(id, data);
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  return deleteProductById(id);
}

export async function adminPublishProduct(id: string): Promise<Product | null> {
  return updateProductById(id, { status: "published" });
}

export async function adminUnpublishProduct(id: string): Promise<Product | null> {
  return updateProductById(id, { status: "draft" });
}

export async function adminArchiveProduct(id: string): Promise<Product | null> {
  return updateProductById(id, { status: "archived" });
}
