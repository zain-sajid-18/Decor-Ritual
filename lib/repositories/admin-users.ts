import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { DbAdminUser, DbNewAdminUser } from "@/lib/db/schema";

/**
 * Admin Users Repository
 * Isolated from the product/category repositories.
 * No fallback to in-memory seed data for security-sensitive operations.
 */

function requireDb() {
  if (!db) {
    throw new Error(
      "Database connection is not available. Authentication requires a configured DATABASE_URL."
    );
  }
  return db;
}

export async function findAdminUserByEmail(
  email: string
): Promise<DbAdminUser | null> {
  const database = requireDb();
  const row = await database.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email.toLowerCase().trim()),
  });
  return row ?? null;
}

export async function findAdminUserById(
  id: string
): Promise<DbAdminUser | null> {
  const database = requireDb();
  const row = await database.query.adminUsers.findFirst({
    where: eq(adminUsers.id, id),
  });
  return row ?? null;
}

export async function insertAdminUser(
  data: Omit<DbNewAdminUser, "id" | "createdAt" | "updatedAt">
): Promise<DbAdminUser> {
  const database = requireDb();
  const now = new Date();
  const id = `usr-${Date.now()}`;

  const [row] = await database
    .insert(adminUsers)
    .values({
      id,
      ...data,
      email: data.email.toLowerCase().trim(),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return row;
}
