import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | ZF Store",
  description:
    "ZF Store participates in the Amazon Services LLC Associates Program. Read our full affiliate disclosure and how we earn commissions from qualifying purchases.",
  alternates: {
    canonical: "/disclosure",
  },
};

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
          Legal &amp; Transparency
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          Affiliate Disclosure
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-stone-600 dark:text-stone-300">

        {/* Amazon's exact required disclosure — verbatim from AOPA Section 5 */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20 p-6 space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Amazon Associates Program Statement
          </h2>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            &ldquo;As an Amazon Associate I earn from qualifying purchases.&rdquo;
          </p>
          <p>
            <strong>
              ZF Store is a participant in the Amazon Services LLC Associates Program, an affiliate
              advertising program designed to provide a means for sites to earn advertising fees by
              advertising and linking to Amazon.com.
            </strong>
          </p>
          <p>
            This means that when you click links on our site that direct to Amazon.com and make a
            qualifying purchase, we may receive a small commission from Amazon. This does{" "}
            <strong>not</strong> increase the price you pay; the cost of any item remains identical
            whether you use our referral link or go directly to Amazon.com.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            How ZF Store Works
          </h2>
          <p>
            ZF Store is an independent product discovery catalog. We research, select, and
            showcase products based on aesthetic quality, functionality, and design excellence. We
            do <strong>not</strong> stock, sell, or ship items directly. All checkouts and orders
            take place on Amazon.com, which provides customer fulfillment, customer service, and
            returns under Amazon&apos;s standard policies.
          </p>
          <p>
            Every product CTA button on our platform (such as &ldquo;View &amp; Purchase on
            Amazon&rdquo;) directs you safely to Amazon.com with our official Associate tag attached.
          </p>
        </section>

        {/* Price disclaimer — required by Amazon AOPA */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Pricing &amp; Availability Disclaimer
          </h2>
          <p>
            Product prices and availability are accurate as of the date/time indicated and are
            subject to change without notice. Any price and availability information displayed on
            Amazon.com at the time of purchase will apply to the purchase of this product.
          </p>
          <p>
            ZF Store does not guarantee prices, discounts, coupons, or availability listed on our
            pages. Always confirm the final price and details directly on Amazon.com prior to
            completing any transaction.
          </p>
        </section>

        {/* Editorial independence */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Editorial Integrity &amp; Independence
          </h2>
          <p>
            Our catalog is curated independently. We do not accept paid reviews, sponsored rankings,
            or placement fees from manufacturers to feature specific items. Our goal is to maintain
            a clean, inspiring, and high-standard directory of products.
          </p>
        </section>

        {/* Links to Privacy Policy & Amazon */}
        <section className="space-y-3 border-t border-stone-200 dark:border-stone-800 pt-8">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Related Documents &amp; External Policies
          </h2>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/privacy-policy"
                className="text-amber-700 hover:text-amber-800 dark:text-amber-400 underline underline-offset-2 font-medium"
              >
                ZF Store Privacy Policy &rarr;
              </Link>
            </li>
            <li>
              <a
                href="https://affiliate-program.amazon.com/help/operating/agreement"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-amber-700 hover:text-amber-800 dark:text-amber-400 underline underline-offset-2"
              >
                Amazon Associates Program Operating Agreement &rarr;
              </a>
            </li>
            <li>
              <a
                href="https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-amber-700 hover:text-amber-800 dark:text-amber-400 underline underline-offset-2"
              >
                Amazon.com Conditions of Use &amp; Privacy Notice &rarr;
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
