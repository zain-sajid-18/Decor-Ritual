import { redirect } from "next/navigation";
import { getSession, type AdminSessionPayload } from "./session";

/**
 * Server-side authorization guard for admin-only operations.
 *
 * Usage:
 *   const admin = await requireAdmin();
 *
 * - In Server Components / layouts: throws a redirect to /admin/login.
 * - In Server Actions: throws a redirect (Next.js handles it via NEXT_REDIRECT).
 *
 * This must be called at the top of every sensitive Server Action and layout
 * to ensure no mutation can succeed without a valid, authorized session.
 *
 * Never rely solely on route protection for security — every Server Action
 * must independently verify the caller's identity and authorization.
 */
export async function requireAdmin(): Promise<AdminSessionPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Explicitly check role — authenticated ≠ automatically authorized
  if (session.role !== "admin" && session.role !== "editor") {
    redirect("/admin/login");
  }

  return session;
}

/**
 * Returns the current session if one exists, without redirecting.
 * Use this for optional session access (e.g., to render user info in layout).
 */
export async function getOptionalSession(): Promise<AdminSessionPayload | null> {
  return getSession();
}
