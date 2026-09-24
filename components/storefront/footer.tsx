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
              An independent design registry and discovery platform. We research, curate, and catalog aesthetic home goods and tactile daily rituals — fulfilled directly via Amazon.
            </p>
          </div>

          {/* Curated Navigation (Admin removed) */}
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
            </ul>
          </div>

          {/* Fulfillment Standards */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
              Assurance
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-400 dark:bg-stone-600" />
                Amazon Prime Delivery
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-400 dark:bg-stone-600" />
                30-Day Verified Returns
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-400 dark:bg-stone-600" />
                Secure A-to-z Guarantee
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Bottom Bar */}
        <div className="border-t border-stone-200/60 pt-6 dark:border-stone-800/60 space-y-4">
          <p className="text-[11px] leading-relaxed text-stone-400 dark:text-stone-500 max-w-4xl">
            <strong>Amazon Associates Disclosure:</strong> ZF Store participates in the Amazon Services LLC Associates Program. As an Amazon Associate, we earn from qualifying purchases at zero added cost to you. Orders, customer support, and fulfillment are processed securely through Amazon.com.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400 dark:text-stone-600">
            <p>© {new Date().getFullYear()} ZF Store. Curated with intention.</p>
            <p>Thoughtfully selected for everyday spaces.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
