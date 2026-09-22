import Link from "next/link";
import { MobileNav } from "./mobile-nav";

export function StorefrontHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:opacity-90">
              ZF Store
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Discover Products
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
