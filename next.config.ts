import type { NextConfig } from "next";

/**
 * HTTP Security Headers
 *
 * Applied to all routes. The CSP is intentionally permissive for the
 * specific third-party hosts the app requires (Cloudinary CDN, Amazon
 * outbound links) while blocking everything else.
 *
 * Do NOT tighten 'unsafe-inline' for scripts without implementing a full
 * nonce-based CSP — Next.js App Router inlines critical scripts by default.
 */
const securityHeaders = [
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Stop MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referrer leakage control
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Restrict dangerous browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Force HTTPS for 1 year (only meaningful in production with TLS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  /**
   * Content-Security-Policy
   *
   * - default-src 'self': base allowlist is own origin only
   * - script-src 'self' 'unsafe-inline' 'unsafe-eval': required for Next.js
   *   App Router inline scripts and React 19 hydration
   * - style-src 'self' 'unsafe-inline' fonts.googleapis.com: Tailwind + Google Fonts
   * - img-src 'self' data: res.cloudinary.com: next/image CDN + Cloudinary
   * - font-src 'self' fonts.gstatic.com: Google Fonts delivery
   * - connect-src 'self' api.cloudinary.com: Cloudinary upload API
   * - frame-ancestors 'none': extra clickjacking protection
   */
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://res.cloudinary.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.cloudinary.com",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        /**
         * Cloudinary image CDN — required for next/image optimization
         * of product images stored in Cloudinary.
         */
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
