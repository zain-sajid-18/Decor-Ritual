/**
 * Product Domain Models for ZF Store
 * Production-oriented, strictly aligned with Amazon Associates discovery requirements.
 */

export type ProductStatus = "draft" | "published" | "archived";

export interface ProductImage {
  id: string;
  url: string;
  cloudinaryPublicId?: string;
  alt: string;
  sortOrder: number;
}

export interface ProductSeo {
  title?: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categorySlug?: string;
  tags: string[];
  images: ProductImage[];
  featured: boolean;
  recommended: boolean;
  status: ProductStatus;
  amazonUrl: string;
  asin?: string;
  seo?: ProductSeo;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export type CreateProductInput = {
  title: string;
  slug: string;
  brand?: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  tags: string[];
  images?: (Omit<ProductImage, "id"> & { cloudinaryPublicId?: string })[];
  featured?: boolean;
  recommended?: boolean;
  status?: ProductStatus;
  amazonUrl: string;
  asin?: string;
  seo?: ProductSeo;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductQueryParams {
  status?: ProductStatus;
  categorySlug?: string;
  categoryId?: string;
  featured?: boolean;
  recommended?: boolean;
  search?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}
