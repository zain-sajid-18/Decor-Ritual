import { redirect } from "next/navigation";

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Route Compatibility:
 * Redirects legacy /products requests to the primary storefront discovery page at /,
 * preserving all active query parameters (q, category, sort, page).
 */
export default async function StorefrontProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedParams)) {
    if (typeof value === "string" && value) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  redirect(queryString ? `/?${queryString}` : "/");
}
