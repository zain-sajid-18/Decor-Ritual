import Link from "next/link";
import { adminGetCategories } from "@/lib/data/admin/categories";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "New Product | ZF Store Admin",
};

export default async function AdminNewProductPage() {
  await requireAdmin();
  const categories = await adminGetCategories();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Create Product"
        description="Add a new product to the catalog. Products are created as drafts and must be published to appear on the public storefront."
        action={
          <Link
            href="/admin/products"
            className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
          >
            ← Back to Products
          </Link>
        }
      />

      <ProductForm categories={categories} />
    </div>
  );
}
