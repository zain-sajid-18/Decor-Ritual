"use client";

import { useEffect } from "react";

/**
 * Root-level global error boundary.
 *
 * This catches errors that escape the nested `app/error.tsx` boundary,
 * including errors thrown by the root layout itself. It must render its
 * own <html> and <body> since the root layout is unavailable.
 *
 * Production behaviour:
 *   - Only the error.digest (opaque server-side ID) is shown to the user.
 *   - The full error stack is logged server-side; it is NEVER surfaced here
 *     to avoid leaking implementation details in a production context.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the server console — replace with your observability provider
    // (e.g., Sentry, Datadog RUM) in production.
    console.error("[GlobalError]", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          backgroundColor: "#09090b",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "480px",
            padding: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#a1a1aa",
              marginBottom: "1.5rem",
            }}
          >
            An unexpected error occurred. Our team has been notified.
            {error.digest && (
              <>
                {" "}
                Reference:{" "}
                <code
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    color: "#71717a",
                  }}
                >
                  {error.digest}
                </code>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "0.375rem",
              backgroundColor: "#fafafa",
              color: "#09090b",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
