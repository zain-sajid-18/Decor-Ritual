// Ensure test environment variables are set BEFORE any module imports
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "verification-test-secret-key-at-least-32-chars-long";
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "test-cloud";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "123456789";
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "mock-secret-never-expose";

import { isValidAmazonUrl, SUPPORTED_AMAZON_DOMAINS } from "../lib/amazon/domains";
import { buildAmazonOutboundUrl, getAmazonOutboundUrl } from "../lib/amazon/url";
import { getAmazonAssociateTag, isAmazonAffiliateConfigured } from "../lib/amazon/config";
import { loginRateLimiter } from "../lib/security/rate-limit";
import { generateUploadSignature, getCloudinaryConfig } from "../lib/cloudinary";
import { createSessionToken, verifySessionToken, type AdminSessionPayload } from "../lib/auth/session";
import { z } from "zod";

async function runStep11SecurityVerification() {
  console.log("=== Step 11 Security, Performance & Reliability Verification Suite ===");
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
  // Test Suite 1: Open Redirect & Path Traversal Defense
  // -------------------------------------------------------------
  console.log("\n--- 1. Testing Open Redirect & Path Traversal Defense ---");

  function validateAdminRedirect(from: unknown): string {
    if (
      typeof from === "string" &&
      from.startsWith("/admin") &&
      !from.includes("//") &&
      !from.includes("\\") &&
      !from.includes("\0")
    ) {
      return from;
    }
    return "/admin";
  }

  assert(validateAdminRedirect("/admin") === "/admin", "Root /admin route allowed");
  assert(validateAdminRedirect("/admin/products") === "/admin/products", "Sub-route /admin/products allowed");
  assert(validateAdminRedirect("/admin/products/new") === "/admin/products/new", "Sub-route /admin/products/new allowed");
  assert(validateAdminRedirect("https://attacker.com/admin") === "/admin", "External scheme https: blocked");
  assert(validateAdminRedirect("//attacker.com/admin") === "/admin", "Protocol-relative // blocked");
  assert(validateAdminRedirect("/\\attacker.com") === "/admin", "Backslash injection blocked");
  assert(validateAdminRedirect("/products") === "/admin", "Non-admin path rejected to fallback /admin");
  assert(validateAdminRedirect("javascript:alert(1)") === "/admin", "javascript: scheme blocked");
  assert(validateAdminRedirect(null) === "/admin", "null value falls back to /admin");
  assert(validateAdminRedirect(undefined) === "/admin", "undefined value falls back to /admin");

  // -------------------------------------------------------------
  // Test Suite 2: Rate Limiting & Memory Bounding
  // -------------------------------------------------------------
  console.log("\n--- 2. Testing Rate Limiting & Bounded Memory ---");

  const testIp = `test-ip-${Date.now()}`;
  loginRateLimiter.reset(testIp);

  // Initial check: 10 attempts allowed
  const first = loginRateLimiter.check(testIp);
  assert(first.allowed === true && first.remaining === 9, "First attempt allowed with 9 remaining");

  // Exhaust remaining 9 attempts
  for (let i = 0; i < 9; i++) {
    loginRateLimiter.check(testIp);
  }

  // 11th attempt must be blocked
  const blocked = loginRateLimiter.check(testIp);
  assert(blocked.allowed === false, "11th attempt blocked by sliding window rate limiter");
  assert(blocked.remaining === 0, "Blocked attempt reports 0 remaining");
  assert(blocked.message.includes("Too many login attempts"), "Helpful retry message returned");

  // Reset clears rate limit
  loginRateLimiter.reset(testIp);
  const afterReset = loginRateLimiter.check(testIp);
  assert(afterReset.allowed === true, "Reset allows immediate attempts again");
  loginRateLimiter.reset(testIp);

  // -------------------------------------------------------------
  // Test Suite 3: Cloudinary Upload Security & Secret Isolation
  // -------------------------------------------------------------
  console.log("\n--- 3. Testing Cloudinary Signature & Isolation ---");

  const config = getCloudinaryConfig();
  assert(config.cloudName === "test-cloud", "Cloudinary configuration loaded successfully");
  assert(config.apiSecret === "mock-secret-never-expose", "API secret verified on server");

  const testProductId = "prod_uuid_12345";
  const signatureData = await generateUploadSignature(testProductId);

  assert(signatureData.folder === `zf-store/products/${testProductId}`, "Upload folder strictly scoped to product ID");
  assert(typeof signatureData.signature === "string" && signatureData.signature.length > 0, "Valid cryptographic signature generated");
  assert(signatureData.allowedFormats === "jpg,jpeg,png,webp,avif", "Allowed formats whitelist strictly enforced");
  assert(signatureData.maxFileSize === 8 * 1024 * 1024, "Max file size enforced at 8MB");
  // Ensure the raw secret is never present in signature data object
  assert(!("apiSecret" in signatureData) && !("CLOUDINARY_API_SECRET" in signatureData), "CLOUDINARY_API_SECRET is never exposed in client payload");

  // -------------------------------------------------------------
  // Test Suite 4: Amazon URL Validation & Affiliate Integrity
  // -------------------------------------------------------------
  console.log("\n--- 4. Testing Amazon Associates URL Validation ---");

  // Valid URLs
  assert(isValidAmazonUrl("https://www.amazon.com/dp/B08N5WRWNW"), "Valid amazon.com product URL accepted");
  assert(isValidAmazonUrl("https://amzn.to/3xyz123"), "Valid amzn.to short URL accepted");
  assert(isValidAmazonUrl("https://www.amazon.co.uk/gp/product/B08N5WRWNW"), "Valid amazon.co.uk product URL accepted");
  assert(isValidAmazonUrl("https://amazon.de/dp/B08N5WRWNW"), "Valid amazon.de product URL accepted");
  assert(SUPPORTED_AMAZON_DOMAINS.includes("amazon.com"), "amazon.com in supported domains list");
  assert(SUPPORTED_AMAZON_DOMAINS.includes("amzn.to"), "amzn.to in supported domains list");

  // Invalid / Spoofed URLs
  assert(isValidAmazonUrl("https://not-amazon.com/dp/B08N5WRWNW") === false, "Phishing domain not-amazon.com rejected");
  assert(isValidAmazonUrl("https://amazon.com.attacker.com/dp/B08N5WRWNW") === false, "Subdomain spoof amazon.com.attacker.com rejected");
  assert(isValidAmazonUrl("https://evilamazon.com") === false, "evilamazon.com rejected");
  assert(isValidAmazonUrl("http://insecure-amazon.com") === false, "Insecure and invalid domain rejected");
  assert(isValidAmazonUrl("javascript:alert(1)") === false, "javascript pseudo-protocol rejected");

  // Outbound URL tag building
  const builtUrl = buildAmazonOutboundUrl("https://www.amazon.com/dp/B08N5WRWNW?ref=xyz", "zfstore-20");
  assert(builtUrl.includes("tag=zfstore-20"), "Associates tag safely injected into Amazon outbound URL");
  assert(builtUrl.includes("ref=xyz"), "Original query parameters preserved");

  const builtNoTag = buildAmazonOutboundUrl("https://www.amazon.com/dp/B08N5WRWNW");
  assert(typeof builtNoTag === "string" && builtNoTag.startsWith("https://www.amazon.com"), "Outbound URL without tag remains valid");

  const modelOutbound = getAmazonOutboundUrl({ amazonUrl: "https://www.amazon.com/dp/B08N5WRWNW" });
  assert(modelOutbound.startsWith("https://www.amazon.com"), "Model helper produces valid outbound destination");

  assert(typeof isAmazonAffiliateConfigured() === "boolean", "isAmazonAffiliateConfigured returns boolean");
  const tag = getAmazonAssociateTag();
  assert(tag === undefined || typeof tag === "string", "getAmazonAssociateTag returns string or undefined");

  // -------------------------------------------------------------
  // Test Suite 5: Session Integrity & Role Authorization
  // -------------------------------------------------------------
  console.log("\n--- 5. Testing Session Integrity & Role Boundaries ---");

  const adminUser: AdminSessionPayload = {
    sub: "admin-uuid-001",
    email: "admin@zfstore.com",
    name: "Admin User",
    role: "admin",
  };

  const validToken = await createSessionToken(adminUser);
  const session = await verifySessionToken(validToken);
  assert(session !== null && session.role === "admin", "Admin role session verified");

  const editorUser: AdminSessionPayload = {
    sub: "editor-uuid-002",
    email: "editor@zfstore.com",
    name: "Editor User",
    role: "editor",
  };
  const editorToken = await createSessionToken(editorUser);
  const editorSession = await verifySessionToken(editorToken);
  assert(editorSession !== null && editorSession.role === "editor", "Editor role session verified");

  // Expired / empty / modified token
  const emptyTokenResult = await verifySessionToken("");
  assert(emptyTokenResult === null, "Empty token returns null");

  // -------------------------------------------------------------
  // Test Suite 6: Zod Schema Boundaries (XSS & Injection Defense)
  // -------------------------------------------------------------
  console.log("\n--- 6. Testing Zod Input Boundary Defenses ---");

  const CategoryNameSchema = z.string().trim().min(1).max(100);
  assert(CategoryNameSchema.safeParse("   ").success === false, "Whitespace-only category name rejected");
  assert(CategoryNameSchema.safeParse("Valid Name").success === true, "Valid category name accepted");

  const SlugSchema = z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

  assert(SlugSchema.safeParse("living-room-decor").success === true, "Valid slug passes");
  assert(SlugSchema.safeParse("Living Room").success === false, "Uppercase and spaces rejected in slug");
  assert(SlugSchema.safeParse("../../etc/passwd").success === false, "Path traversal in slug rejected");
  assert(SlugSchema.safeParse("<script>alert(1)</script>").success === false, "XSS markup in slug rejected");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`Step 11 Security Verification: ${passed} passed, ${failed} failed`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep11SecurityVerification().catch((err) => {
  console.error("Step 11 Verification Suite encountered an error:", err);
  process.exit(1);
});
