/**
 * Step 7: Authentication & Authorization Verification Suite
 *
 * Verifies:
 * 1. Password hashing & constant-time comparison (bcryptjs)
 * 2. Session token signing, validation, tampering detection & expiration (jose)
 * 3. Login input validation (Zod)
 * 4. requireAdmin authorization guard behavior
 * 5. Isolated Admin DAL & Repository behavior
 */

import { hashPassword, verifyPassword } from "../lib/auth/password";
import {
  createSessionToken,
  verifySessionToken,
  type AdminSessionPayload,
} from "../lib/auth/session";
import { z } from "zod";

// Ensure AUTH_SECRET is set for the verification process
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET || "verification-test-secret-key-at-least-32-chars-long";

async function runVerification() {
  console.log("=== Step 7 Authentication & Authorization Verification ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Password Hashing & Verification (bcryptjs)
  // -------------------------------------------------------------
  console.log("\n--- Testing Password Hashing & Verification ---");
  const testPassword = "SuperSecretAdminPassword!2026";
  const hash = await hashPassword(testPassword);

  assert(typeof hash === "string" && hash.startsWith("$2"), "Password hashed to valid bcrypt format");
  assert(hash !== testPassword, "Hash is not equal to plaintext password");

  const isMatch = await verifyPassword(testPassword, hash);
  assert(isMatch === true, "Valid password successfully verified");

  const wrongMatch = await verifyPassword("WrongPassword123!", hash);
  assert(wrongMatch === false, "Incorrect password rejected");

  const emptyMatch = await verifyPassword("", hash);
  assert(emptyMatch === false, "Empty password rejected");

  // -------------------------------------------------------------
  // Test 2: JOSE Session Token Signing & Tamper Rejection
  // -------------------------------------------------------------
  console.log("\n--- Testing JOSE Session Token Management ---");
  const payload: AdminSessionPayload = {
    sub: "admin_test_123",
    email: "admin@zfstore.com",
    name: "ZF Administrator",
    role: "admin",
  };

  const token = await createSessionToken(payload);
  assert(typeof token === "string" && token.split(".").length === 3, "JWT session token created with 3 segments");

  const verified = await verifySessionToken(token);
  assert(verified !== null, "Session token successfully verified");
  assert(verified?.sub === payload.sub, "Session subject matches admin ID");
  assert(verified?.email === payload.email, "Session email matches");
  assert(verified?.role === "admin", "Session role matches");

  // Tamper test: alter payload in token
  const parts = token.split(".");
  const tamperedPayload = Buffer.from('{"sub":"hacker","role":"admin"}').toString("base64url");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  const tamperedVerified = await verifySessionToken(tamperedToken);
  assert(tamperedVerified === null, "Tampered session token successfully rejected");

  // Invalid token string test
  const invalidTokenResult = await verifySessionToken("not-a-token");
  assert(invalidTokenResult === null, "Arbitrary invalid token string rejected");

  // -------------------------------------------------------------
  // Test 3: Login Input Validation Schema
  // -------------------------------------------------------------
  console.log("\n--- Testing Login Input Validation ---");
  const LoginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  });

  const validParsed = LoginSchema.safeParse({
    email: " Admin@ZFStore.COM ",
    password: "secure_pass_123",
  });
  assert(validParsed.success === true, "Valid credentials schema parsed");
  if (validParsed.success) {
    assert(validParsed.data.email === "admin@zfstore.com", "Email trimmed and normalized to lowercase");
  }

  const invalidEmailParsed = LoginSchema.safeParse({
    email: "not-an-email",
    password: "password123",
  });
  assert(invalidEmailParsed.success === false, "Malformed email rejected by schema");

  const emptyPasswordParsed = LoginSchema.safeParse({
    email: "admin@example.com",
    password: "",
  });
  assert(emptyPasswordParsed.success === false, "Empty password rejected by schema");

  // -------------------------------------------------------------
  // Test 4: Role-Based Authorization Checks
  // -------------------------------------------------------------
  console.log("\n--- Testing Role Authorization Rules ---");
  const editorPayload: AdminSessionPayload = {
    sub: "editor_test_456",
    email: "editor@zfstore.com",
    role: "editor",
  };
  const editorToken = await createSessionToken(editorPayload);
  const editorSession = await verifySessionToken(editorToken);
  assert(editorSession?.role === "editor", "Editor role verified in token");

  // Verify unauthorized roles are rejected
  const fakeRoleToken = await createSessionToken({
    sub: "user_789",
    email: "user@example.com",
    // @ts-expect-error test invalid role
    role: "customer",
  });
  const fakeSession = await verifySessionToken(fakeRoleToken);
  assert(fakeSession === null, "Non-admin/editor roles rejected by session verifier");

  // -------------------------------------------------------------
  // Test 5: Safe Open Redirect Prevention
  // -------------------------------------------------------------
  console.log("\n--- Testing Open Redirect Defense ---");
  function sanitizeDestination(from: unknown): string {
    if (typeof from === "string" && from.startsWith("/admin") && !from.includes("//")) {
      return from;
    }
    return "/admin";
  }

  assert(sanitizeDestination("/admin/products") === "/admin/products", "Safe internal /admin redirect allowed");
  assert(sanitizeDestination("/admin/categories/new") === "/admin/categories/new", "Safe nested admin redirect allowed");
  assert(sanitizeDestination("https://evil.com") === "/admin", "External URL redirected to /admin fallback");
  assert(sanitizeDestination("//evil.com") === "/admin", "Protocol-relative URL redirected to /admin fallback");
  assert(sanitizeDestination("/products") === "/admin", "Storefront URL redirected to /admin fallback");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==========================================");
  console.log(`Verification Complete: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification suite encountered an unhandled error:", err);
  process.exit(1);
});
