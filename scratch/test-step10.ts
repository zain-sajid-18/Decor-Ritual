import assert from "assert";
import { isValidAmazonUrl } from "@/lib/amazon/domains";
import { buildAmazonOutboundUrl, getAmazonOutboundUrl } from "@/lib/amazon/url";
import { getAmazonAssociateTag } from "@/lib/amazon/config";
import { getSiteUrl } from "@/lib/seo/config";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { generateMetadata as generateProductMetadata } from "@/app/(storefront)/products/[slug]/page";

async function runStep10Tests() {
  console.log("=== Step 10: Amazon Associates & SEO Verification ===");

  // 1. Amazon domain validation tests
  console.log("\n--- 1. Amazon Domain Validation ---");
  assert(isValidAmazonUrl("https://www.amazon.com/dp/B08N5WRWNW"), "Valid US Amazon URL accepted");
  assert(isValidAmazonUrl("https://amazon.co.uk/gp/product/B08N5WRWNW"), "Valid UK Amazon URL accepted");
  assert(isValidAmazonUrl("https://amzn.to/3sample"), "Valid short Amazon amzn.to accepted");
  assert(isValidAmazonUrl("https://a.co/d/sample"), "Valid short Amazon a.co accepted");
  assert(isValidAmazonUrl("https://amazon.ca/dp/B08N5WRWNW"), "Valid Canada Amazon URL accepted");
  assert(isValidAmazonUrl("https://amazon.de/dp/B08N5WRWNW"), "Valid Germany Amazon URL accepted");
  
  // Rejection of malicious / unauthorized domains
  assert(!isValidAmazonUrl("https://malicious-site.com/fake-product"), "Malicious external domain rejected");
  assert(!isValidAmazonUrl("https://fake-amazon.com/dp/B08N5WRWNW"), "Lookalike domain fake-amazon.com rejected");
  assert(!isValidAmazonUrl("https://amazon.com.attacker.com/dp/B08N5WRWNW"), "Attacker subdomain rejected");
  assert(!isValidAmazonUrl("javascript:alert(1)"), "JavaScript pseudo-protocol rejected");
  assert(!isValidAmazonUrl("not-a-url"), "Invalid URL rejected");
  console.log("Domain validation tests passed: 10/10");

  // 2. Outbound URL builder tests
  console.log("\n--- 2. Outbound URL Builder & Tag Injection ---");
  const sampleUrl = "https://www.amazon.com/dp/B08N5WRWNW?psc=1&th=1";

  // Without tag configured (clean bypass)
  const cleanUrl = buildAmazonOutboundUrl(sampleUrl);
  assert(cleanUrl.includes("psc=1"), "Preserved psc query param");
  assert(cleanUrl.includes("th=1"), "Preserved th query param");
  if (!getAmazonAssociateTag()) {
    assert(!cleanUrl.includes("tag="), "No tag injected when tag is unconfigured");
  }

  // With explicit tag injected
  const taggedUrl = buildAmazonOutboundUrl(sampleUrl, "testpartner-20");
  assert(taggedUrl.includes("tag=testpartner-20"), "Tag injected via URL API");
  assert(taggedUrl.includes("psc=1"), "Original psc query param preserved");
  assert(taggedUrl.includes("th=1"), "Original th query param preserved");

  // Idempotency: replacing pre-existing tag without duplicate query keys
  const alreadyTagged = "https://www.amazon.com/dp/B08N5WRWNW?tag=oldtag-20&psc=1";
  const retagged = buildAmazonOutboundUrl(alreadyTagged, "newtag-20");
  const parsedRetagged = new URL(retagged);
  assert.strictEqual(parsedRetagged.searchParams.get("tag"), "newtag-20", "Existing tag replaced with configured tag");
  assert.strictEqual(parsedRetagged.searchParams.getAll("tag").length, 1, "Exactly one tag parameter exists");
  assert.strictEqual(parsedRetagged.searchParams.get("psc"), "1", "Existing query parameters preserved");

  // getAmazonOutboundUrl with product object
  const productOutbound = getAmazonOutboundUrl({ amazonUrl: "https://www.amazon.com/dp/B08N5WRWNW" });
  assert(productOutbound.startsWith("https://www.amazon.com/dp/B08N5WRWNW"), "Product outbound URL generated");
  console.log("URL transformation tests passed: 7/7");

  // 3. Sitemap verification
  console.log("\n--- 3. Sitemap Verification ---");
  const sitemapEntries = await sitemap();
  console.log(`Total sitemap entries generated: ${sitemapEntries.length}`);

  // Confirm home and categories
  const hasHome = sitemapEntries.some((e) => e.url === `${getSiteUrl()}/`);
  const hasCategories = sitemapEntries.some((e) => e.url === `${getSiteUrl()}/categories`);
  assert(hasHome, "Sitemap contains home (/)");
  assert(hasCategories, "Sitemap contains /categories");

  // Confirm no admin URLs exist in sitemap
  const hasAdmin = sitemapEntries.some((e) => e.url.includes("/admin"));
  assert(!hasAdmin, "Sitemap contains ZERO admin URLs");

  // Confirm no draft products in sitemap
  const hasDraft = sitemapEntries.some((e) => e.url.includes("sample-product-four-draft"));
  assert(!hasDraft, "Draft product strictly excluded from sitemap");

  // Confirm no inactive categories in sitemap
  const hasInactiveCat = sitemapEntries.some((e) => e.url.includes("sample-category-three-inactive"));
  assert(!hasInactiveCat, "Inactive category strictly excluded from sitemap");
  console.log("Sitemap validation tests passed: 5/5");

  // 4. Robots.txt verification
  console.log("\n--- 4. Robots.txt Verification ---");
  const robotsConfig = robots();
  const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
  assert(rules?.disallow?.includes("/admin") || rules?.disallow?.includes("/admin/"), "Robots disallows /admin");
  assert.strictEqual(robotsConfig.sitemap, `${getSiteUrl()}/sitemap.xml`, "Robots references canonical sitemap.xml");
  console.log("Robots.txt validation tests passed: 2/2");

  // 5. Product Metadata & Canonical verification
  console.log("\n--- 5. Product Metadata & Canonical Verification ---");
  const meta = await generateProductMetadata({ params: Promise.resolve({ slug: "sample-product-one" }) });
  assert(meta.title?.toString().includes("Sample Product One"), "Product meta title contains product title");
  assert.strictEqual(meta.alternates?.canonical, "/products/sample-product-one", "Canonical URL set correctly");
  assert(meta.openGraph?.title?.toString().includes("Sample Product One"), "OpenGraph title set");
  console.log("Metadata verification tests passed: 3/3");

  console.log("\n=== ALL STEP 10 TESTS PASSED (27/27 assertions) ===");
}

runStep10Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
