/**
 * Admin domain definitions and operation contracts for ZF Store
 */

import type { ProductStatus } from "./product";

export interface AdminDashboardMetrics {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  totalCategories: number;
  activeCategories: number;
}

export interface AdminProductFilterParams {
  status?: ProductStatus;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "editor";
  createdAt: string;
}
