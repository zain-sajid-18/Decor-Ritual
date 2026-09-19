import {
  findAdminUserByEmail,
  findAdminUserById,
} from "@/lib/repositories/admin-users";
import type { DbAdminUser } from "@/lib/db/schema";

/**
 * Admin Data Access Layer: Admin Users
 * Isolated from the product/category admin DALs.
 * Used exclusively by authentication logic.
 */

/**
 * Finds an admin user by their email address.
 * Used during the login flow to validate credentials.
 */
export async function adminGetUserByEmail(
  email: string
): Promise<DbAdminUser | null> {
  return findAdminUserByEmail(email);
}

/**
 * Finds an admin user by their ID.
 * Used during session verification to confirm the user still exists and is active.
 */
export async function adminGetUserById(
  id: string
): Promise<DbAdminUser | null> {
  return findAdminUserById(id);
}
