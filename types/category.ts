/**
 * Category Domain Models for ZF Store
 */

export interface CategorySeo {
  title?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  seo?: CategorySeo;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export type CreateCategoryInput = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
  seo?: CategorySeo;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
