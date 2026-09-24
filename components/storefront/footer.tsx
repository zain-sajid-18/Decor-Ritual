import Link from "next/link";

export function StorefrontFooter() {
  return (
    <footer className="w-full border-t border-stone-200/60 bg-[#f7f5f0]/80 dark:border-stone-800/60 dark:bg-[#151412]/80 mt-auto transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">

          {/* Brand & Editorial Bio */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-serif font-bold text-xs">
                ZF
              </span>
              <span className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100">
                ZF Store
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              An independent design registry and discovery platform. We research, curate, and catalog aesthetic home goods and tactile daily rituals — all purchases are fulfilled directly by Amazon.com.
            </p>
            {/* Amazon Associates exact mandated statement (AOPA Section 5) */}
            <p className="max-w-md text-xs leading-relaxed text-amber-700 dark:text-amber-400 font-semibold">
              As an Amazon Associate I earn from qualifying purchases.
            </p>
          </div>

          {/* Curated Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
              Directory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/"
                  className="text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                >
                  Curated Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                >
                  Explore Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/disclosure"
                  className="text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                >
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* How It Works */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
              How It Works
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400 dark:bg-stone-600" />
                We curate — Amazon fulfills
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400 dark:bg-stone-600" />
                Secure checkout on Amazon.com
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400 dark:bg-stone-600" />
                Amazon handles returns &amp; support
              </li>
            </ul>
          </div>
        </div>

        {/* Full Affiliate Disclosure & Bottom Bar */}
        <div className="border-t border-stone-200/60 pt-6 dark:border-stone-800/60 space-y-3">
          {/* Amazon Associates required disclosure statement */}
          <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400 max-w-4xl">
            <strong>Amazon Associates Disclosure:</strong> ZF Store is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate I earn from qualifying purchases at no additional cost to you.{" "}
            <Link
              href="/disclosure"
              className="underline underline-offset-2 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              Read full disclosure →
            </Link>
          </p>
          {/* Price disclaimer — required by Amazon Associates Operating Agreement */}
          <p className="text-[11px] leading-relaxed text-stone-400 dark:text-stone-500 max-w-4xl">
            <strong>Price Disclaimer:</strong> Product prices and availability are accurate as of the date/time indicated and are subject to change without notice. The price and availability of any product displayed on this site may differ from the actual price and availability on Amazon at the time of purchase. The applicable price will be the one listed on Amazon at the time of your order.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400 dark:text-stone-500 pt-2 border-t border-stone-200/40 dark:border-stone-800/40">
            <p>© {new Date().getFullYear()} ZF Store. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href="/disclosure"
                className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              >
                Affiliate Disclosure
              </Link>
              <span>•</span>
              <Link
                href="/privacy-policy"
                className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <span>All purchases fulfilled by Amazon.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
