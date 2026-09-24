import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ZF Store",
  description:
    "ZF Store privacy policy — how we handle your data, cookies, and affiliate links in full compliance with Amazon Associates policies.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
          Legal
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          Privacy Policy
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Overview
          </h2>
          <p>
            ZF Store (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates as an independent,
            curated product discovery platform. This Privacy Policy explains how we handle
            information when you visit our website. We respect your privacy and do not collect,
            sell, or monetize any personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Information We Collect
          </h2>
          <p>
            <strong>We do not collect personal information.</strong> ZF Store does not require account
            registration, does not maintain user profiles, does not operate an internal checkout or
            shopping cart, and does not process payments. All transactions occur exclusively on Amazon.com.
          </p>
          <p>The only client-side data saved on your device is:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Theme preference:</strong> Stored locally in your browser&apos;s{" "}
              <code className="rounded bg-stone-100 dark:bg-stone-800 px-1 py-0.5 text-xs font-mono">
                localStorage
              </code>{" "}
              as <code className="rounded bg-stone-100 dark:bg-stone-800 px-1 py-0.5 text-xs font-mono">zf-theme</code>{" "}
              solely to remember whether you prefer light or dark mode across visits.
            </li>
            <li>
              <strong>Notice dismissal:</strong> Stored temporarily in your browser&apos;s{" "}
              <code className="rounded bg-stone-100 dark:bg-stone-800 px-1 py-0.5 text-xs font-mono">
                sessionStorage
              </code>{" "}
              so you don&apos;t see the top affiliate notice repeatedly during a single browsing session.
            </li>
          </ul>
        </section>

        {/* Amazon Associates specific required clause */}
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Amazon Associates &amp; Third-Party Cookies Disclosure
          </h2>
          <p>
            <strong>
              ZF Store is a participant in the Amazon Services LLC Associates Program, an affiliate
              advertising program designed to provide a means for sites to earn advertising fees by
              advertising and linking to Amazon.com.
            </strong>
          </p>
          <p className="font-medium text-stone-900 dark:text-stone-100">
            In accordance with Amazon Associates Program policies, please note:
          </p>
          <div className="rounded-xl border border-amber-300/80 bg-white/70 p-4 dark:border-amber-800 dark:bg-stone-900/60 text-xs leading-relaxed text-stone-700 dark:text-stone-200 font-mono">
            &ldquo;Third parties (including Amazon and other advertisers) may serve content and
            advertisements, collect information directly from visitors, and place or recognize
            cookies on visitors&apos; browsers.&rdquo;
          </div>
          <p>
            When you click an outbound link to Amazon from ZF Store, Amazon places cookies on your
            browser to track and attribute qualifying purchases. These cookies enable Amazon to
            credit our account with referral commissions. You can learn more about how Amazon
            collects and handles data by reading{" "}
            <a
              href="https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-amber-700 hover:text-amber-800 dark:text-amber-400 underline underline-offset-2"
            >
              Amazon&apos;s Privacy Notice
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Managing Cookies &amp; Tracking
          </h2>
          <p>
            Most modern web browsers allow you to control cookies through browser settings. You can
            choose to block or delete cookies at any time. Doing so will not affect your ability to
            browse product recommendations on ZF Store, though it may alter how Amazon tracks
            referral links when you arrive on Amazon.com.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            External Links
          </h2>
          <p>
            Our website contains outbound links to external sites, primarily Amazon.com. When you
            click an outbound link, you are leaving ZF Store. We have no control over and assume no
            responsibility for the content, privacy policies, or practices of any third-party sites
            or services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Children&apos;s Privacy
          </h2>
          <p>
            ZF Store does not knowingly collect or solicit any personal information from children
            under the age of 13. If you believe that a child under 13 has provided us with personal
            information, please reach out so that we can take appropriate steps.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Updates to This Policy
          </h2>
          <p>
            We may revise this Privacy Policy periodically to reflect changes in our practices or
            applicable affiliate program guidelines. Revisions will be posted here with an updated
            date.
          </p>
        </section>

        <section className="space-y-3 border-t border-stone-200 dark:border-stone-800 pt-8">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Related Information
          </h2>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/disclosure"
                className="text-amber-700 hover:text-amber-800 dark:text-amber-400 underline underline-offset-2 font-medium"
              >
                Affiliate Disclosure &rarr;
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
                Amazon.com Privacy Notice &rarr;
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
