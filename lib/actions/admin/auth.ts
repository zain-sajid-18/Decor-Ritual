"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { isDbAvailable } from "@/lib/db";
import { adminGetUserByEmail } from "@/lib/data/admin/admin-users";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";
import { loginRateLimiter } from "@/lib/security/rate-limit";
import type { ActionState } from "@/types/action";

/**
 * Derives a stable rate-limit identifier from the incoming request headers.
 * Prefers the first IP in X-Forwarded-For, falls back to X-Real-IP, then
 * a sentinel value so rate limiting still functions behind a misconfigured proxy.
 */
async function getRateLimitIdentifier(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }
  const realIp = headerStore.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

const LoginSchema = z.object({
  email: z
    .string({ message: "Email is required." })
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address."),
  password: z
    .string({ message: "Password is required." })
    .min(1, "Password is required."),
});

/**
 * Server Action: Login
 *
 * - Validates email/password format.
 * - Looks up admin user by email.
 * - Uses generic error message to prevent account enumeration.
 * - Verifies bcrypt hash using constant-time comparison.
 * - Creates a signed session token and sets HTTP-only cookie.
 * - Redirects to the intended destination or /admin on success.
 */
export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  // Check BEFORE any schema validation or DB queries to minimise work done per
  // rejected request and to prevent timing-based enumeration of valid emails.
  const identifier = await getRateLimitIdentifier();
  const rateLimit = loginRateLimiter.check(identifier);
  if (!rateLimit.allowed) {
    return { success: false, message: rateLimit.message };
  }

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = LoginSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Please enter a valid email and password.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validated.data;

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Authentication is not available in this environment. DATABASE_URL is not configured.",
    };
  }

  try {
    // Look up user — use generic error to prevent email enumeration
    const user = await adminGetUserByEmail(email);

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Check account is active
    if (!user.isActive) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Verify password using constant-time bcrypt comparison
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // Create and set session cookie
    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role as "admin" | "editor",
    });

    await setSessionCookie(token);

    // Reset rate limit counter on successful login
    loginRateLimiter.reset(identifier);
  } catch (error) {
    // Never expose internal error details to the client
    const message = (error as Error)?.message ?? "";
    if (message.includes("AUTH_SECRET")) {
      // Surface configuration errors clearly but safely
      return {
        success: false,
        message:
          "Server configuration error. AUTH_SECRET is not set. Contact the system administrator.",
      };
    }
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    };
  }

  // Validate and use the redirect destination safely to prevent open redirects
  const from = formData.get("from");
  let destination = "/admin";
  if (typeof from === "string" && from.startsWith("/admin") && !from.includes("//")) {
    destination = from;
  }

  redirect(destination);
}

/**
 * Server Action: Logout
 *
 * - Clears the session cookie.
 * - Revalidates all admin paths to invalidate cached content.
 * - Redirects to login page.
 */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
