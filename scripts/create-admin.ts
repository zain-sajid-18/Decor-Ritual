/**
 * Admin User Bootstrap Script
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts --email=admin@example.com --password=secret --name="Admin"
 * Or via environment variables:
 *   INITIAL_ADMIN_EMAIL="admin@example.com" INITIAL_ADMIN_PASSWORD="secret" npx tsx scripts/create-admin.ts
 */

import { isDbAvailable, db } from "../lib/db";
import { adminUsers } from "../lib/db/schema";
import { hashPassword } from "../lib/auth/password";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function main() {
  const args = process.argv.slice(2);
  let email = process.env.INITIAL_ADMIN_EMAIL;
  let password = process.env.INITIAL_ADMIN_PASSWORD;
  let name = process.env.INITIAL_ADMIN_NAME || "Store Administrator";
  let role: "admin" | "editor" = "admin";

  for (const arg of args) {
    if (arg.startsWith("--email=")) {
      email = arg.split("=")[1];
    } else if (arg.startsWith("--password=")) {
      password = arg.split("=")[1];
    } else if (arg.startsWith("--name=")) {
      name = arg.split("=")[1];
    } else if (arg.startsWith("--role=")) {
      const r = arg.split("=")[1];
      if (r === "admin" || r === "editor") role = r;
    }
  }

  if (!email || !password) {
    console.error("Error: Both email and password are required.");
    console.error("Usage:");
    console.error(
      "  npx tsx scripts/create-admin.ts --email=admin@example.com --password=SecurePassword123"
    );
    process.exit(1);
  }

  if (!isDbAvailable || !db) {
    console.error(
      "Error: Database is not available. Please ensure DATABASE_URL is properly configured."
    );
    process.exit(1);
  }

  console.log(`Creating/updating admin user: ${email}...`);

  const passwordHash = await hashPassword(password);

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase().trim()))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(adminUsers)
      .set({
        passwordHash,
        name,
        role,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, existing[0].id));
    console.log(`✓ Admin user ${email} updated successfully.`);
  } else {
    const id = `adm_${crypto.randomBytes(8).toString("hex")}`;
    await db.insert(adminUsers).values({
      id,
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      role,
      isActive: true,
    });
    console.log(`✓ Admin user ${email} created successfully with ID: ${id}`);
  }
}

main().catch((err) => {
  console.error("Failed to create admin user:", err);
  process.exit(1);
});
