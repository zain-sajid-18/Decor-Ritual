import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | Decor Ritual",
  description:
    "Decor Ritual participates in the Amazon Services LLC Associates Program. Read our full affiliate disclosure and how we earn commissions.",
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
          Legal & Transparency
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          Affiliate Disclosure
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        {/* Required FTC/Amazon Disclosure Statement */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-950/20 p-6 space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Amazon Associates Program Disclosure
          </h2>
          <p>
            <strong>
              Decor Ritual is a participant in the Amazon Services LLC
              Associates Program, an affiliate advertising program designed to
              provide a means for sites to earn advertising fees by advertising
              and linking to Amazon.com.
            </strong>
          </p>
          <p>
            As an Amazon Associate, we earn from qualifying purchases.{" "}
            <strong>
              This means that when you click a link on our site and make a
              purchase on Amazon, we may receive a small commission at no
              additional cost to you.
            </strong>
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            How It Works
          </h2>
          <p>
            Decor Ritual is a curated product discovery platform. We research,
            select, and present home décor and lifestyle products that meet our
            editorial standards. We do <strong>not</strong> sell products
            directly — all purchases are made through Amazon.com, which handles
            payment, shipping, fulfillment, and customer service.
          </p>
          <p>
            Every &quot;View on Amazon&quot; or &quot;Purchase on Amazon&quot;
            button on our site directs you to Amazon.com. If you click such a
            link and make a purchase within Amazon&apos;s attribution window, we
            may earn an affiliate commission.
          </p>
        </section>

        {/* Price disclaimer */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Pricing & Availability
          </h2>
          <p>
            Product prices and availability are accurate at the time of initial
            publication but{" "}
            <strong>
              are subject to change without notice. The price displayed on
              Amazon at the time of purchase is the final price you pay.
            </strong>{" "}
            Always verify the current price on Amazon before completing your
            order.
          </p>
        </section>

        {/* Editorial independence */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Editorial Independence
          </h2>
          <p>
            Our product selections are made independently based on quality,
            design, and editorial merit. We do not accept payment from brands or
            manufacturers to feature products. Affiliate commissions do not
            influence which products we curate or how we describe them.
          </p>
        </section>

        {/* FTC compliance note */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            FTC Compliance
          </h2>
          <p>
            This disclosure is made in accordance with the Federal Trade
            Commission&apos;s{" "}
            <strong>16 CFR Part 255: Guides Concerning the Use of Endorsements
            and Testimonials in Advertising</strong>, and with Amazon&apos;s
            Associates Program Operating Agreement.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3 border-t border-stone-200 dark:border-stone-800 pt-8">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Questions?
          </h2>
          <p>
            If you have any questions about this disclosure or how we use
            affiliate links, please visit our{" "}
            <Link
              href="/"
              className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-2"
            >
              homepage
            </Link>{" "}
            or reach out through the contact information provided in the footer.
          </p>
        </section>
      </div>
    </div>
  );
}
