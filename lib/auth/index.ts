/**
 * Authentication Boundary for ZF Store
 * 
 * NOTE: Authentication is intentionally deferred to Step 8.
 * This file establishes the architectural boundary for future session checks,
 * role-based access control, and route middleware protection.
 * 
 * Do NOT store plain-text passwords or hardcoded credentials here.
 */

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "editor";
  };
  expiresAt: string;
}

/**
 * Placeholder for future server-side session retrieval.
 * Currently returns null in unauthenticated state.
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  // To be implemented during Step 8 (Auth.js / NextAuth integration)
  return null;
}

/**
 * Placeholder for future server-side authorization check.
 */
export async function requireAdminSession(): Promise<AuthSession | null> {
  // To be implemented during Step 8
  return null;
}
