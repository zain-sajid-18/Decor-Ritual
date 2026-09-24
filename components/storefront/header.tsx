import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function StorefrontHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/60 bg-[#fbfaf7]/80 backdrop-blur-md dark:border-stone-800/60 dark:bg-[#121110]/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand: Luxury Minimalist Monogram */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-serif font-bold text-sm tracking-tighter shadow-sm transition-transform duration-300 group-hover:scale-105">
            ZF
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-none">
              ZF Store
            </span>
            <span className="text-[9px] font-medium tracking-[0.22em] uppercase text-stone-400 dark:text-stone-500 mt-1">
              Curated Living
            </span>
          </div>
        </Link>

        {/* Desktop Nav: Clean & Editorial */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="rounded-lg px-3.5 py-1.5 text-xs font-medium tracking-wide text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
          >
            Catalog
          </Link>
          <Link
            href="/categories"
            className="rounded-lg px-3.5 py-1.5 text-xs font-medium tracking-wide text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
          >
            Collections
          </Link>
        </nav>

        {/* Right side controls: Theme switcher & Mobile Drawer */}
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
