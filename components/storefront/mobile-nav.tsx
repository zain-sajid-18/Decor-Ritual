"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  // Close menu when route changes
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Prevent background scroll when mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white/70 text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-16 z-40 bg-stone-950/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-down Menu */}
          <div className="fixed top-16 left-0 right-0 z-50 border-b border-stone-200 bg-[#fbfaf7]/95 backdrop-blur-lg px-6 py-6 shadow-xl dark:border-stone-800 dark:bg-[#121110]/95 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1.5">
              <Link
                href="/"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-200/50 dark:text-stone-200 dark:hover:bg-stone-800/60 transition-colors"
              >
                <span>Curated Catalog</span>
                <span className="text-xs text-stone-400">→</span>
              </Link>
              <Link
                href="/categories"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-200/50 dark:text-stone-200 dark:hover:bg-stone-800/60 transition-colors"
              >
                <span>Collections</span>
                <span className="text-xs text-stone-400">→</span>
              </Link>
              <div className="my-2 border-t border-stone-200/80 dark:border-stone-800/80" />
              <Link
                href="/disclosure"
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-200/50 dark:text-stone-400 dark:hover:bg-stone-800/60 transition-colors"
              >
                <span>Affiliate Disclosure</span>
                <span className="text-xs text-stone-400">→</span>
              </Link>
              <Link
                href="/privacy-policy"
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium text-stone-600 hover:bg-stone-200/50 dark:text-stone-400 dark:hover:bg-stone-800/60 transition-colors"
              >
                <span>Privacy Policy</span>
                <span className="text-xs text-stone-400">→</span>
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
