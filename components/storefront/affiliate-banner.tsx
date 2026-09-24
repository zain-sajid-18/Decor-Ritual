"use client";

import * as React from "react";
import Link from "next/link";

/**
 * Top Affiliate Notice & Compliance Banner
 *
 * Mandated by:
 * 1. Amazon Associates Operating Agreement Section 5
 *    - Must prominently identify as an Associate on site entry
 *    - Exact wording: "As an Amazon Associate I earn from qualifying purchases."
 * 2. FTC Endorsement Guides
 *    - Conspicuous disclosure required BEFORE the user clicks any affiliate links
 *    - Cannot be solely relegated to the footer
 */
export function AffiliateNoticeBanner() {
  const [dismissed, setDismissed] = React.useState(true); // default true to avoid SSR mismatch

  React.useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("zf_affiliate_notice_dismissed");
      if (!isDismissed) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("zf_affiliate_notice_dismissed", "1");
    } catch {
      // ignore storage errors
    }
  };

  if (dismissed) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Affiliate Notice"
      className="relative z-50 border-b border-amber-200/80 bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 px-4 py-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-gradient-to-r dark:from-[#1c160c] dark:via-[#221a0f] dark:to-[#1c160c] dark:text-amber-200"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-center sm:text-left">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Affiliate Disclosure:
          </span>
          <span>
            As an Amazon Associate I earn from qualifying purchases. Products are fulfilled by Amazon.com.
          </span>
          <span className="hidden sm:inline text-amber-400 dark:text-amber-600">•</span>
          <div className="inline-flex items-center gap-2">
            <Link
              href="/disclosure"
              className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              Full Disclosure
            </Link>
            <span className="text-amber-300 dark:text-amber-700">|</span>
            <Link
              href="/privacy-policy"
              className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-200/50 hover:text-amber-950 dark:text-amber-400 dark:hover:bg-amber-900/50 dark:hover:text-amber-100 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
          aria-label="Dismiss affiliate notice for this session"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
