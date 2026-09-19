import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "zf_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * The payload stored inside the session token.
 * Never include passwordHash or secrets here.
 */
export interface AdminSessionPayload {
  sub: string; // admin user ID
  email: string;
  name?: string;
  role: "admin" | "editor";
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET environment variable is not set. Session signing requires a secret key."
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Signs a new session token (JWT) with the AUTH_SECRET.
 */
export async function createSessionToken(
  payload: AdminSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/**
 * Verifies and decodes a session token.
 * Returns null if the token is invalid, expired, or tampered with.
 */
export async function verifySessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    const { sub, email, name, role } = payload as Record<string, unknown>;

    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      (role !== "admin" && role !== "editor")
    ) {
      return null;
    }

    return {
      sub,
      email,
      name: typeof name === "string" ? name : undefined,
      role,
    };
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie in the current response.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

/**
 * Reads the raw session token from the cookie store.
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Gets the verified session payload from the current request cookies.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<AdminSessionPayload | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Clears the session cookie, effectively logging the user out.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
