import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

/**
 * Next.js 16 Proxy (formerly Middleware)
 *
 * Runs before requests to /admin/* routes.
 * Performs fast stateless cookie validation using JOSE JWT verification.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isAuthenticated = !!session;

  // Allow access to login page
  if (pathname === "/admin/login") {
    // If already authenticated, redirect to /admin dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // If accessing any other /admin route without an active session, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
