import Link from "next/link";

export function StorefrontFooter() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ZF Store
            </span>
            <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              A curated product discovery platform. We research and feature high-utility products,
              connecting you directly to trusted merchant fulfillment on Amazon.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Discovery
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Management
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/admin"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Legal Notice */}
        <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="rounded-md bg-zinc-100 p-4 text-xs leading-relaxed text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
              Amazon Associates Program Disclosure:
            </p>
            <p>
              As an Amazon Associate, ZF Store earns from qualifying purchases. When you click our product
              links and complete a purchase on Amazon, we may receive an affiliate commission at no extra cost to you.
              All orders, payments, fulfillment, and customer service are processed directly by Amazon.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <p>© {new Date().getFullYear()} ZF Store. All rights reserved.</p>
            <p className="text-zinc-400 dark:text-zinc-500">
              Production Architecture Foundation
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
