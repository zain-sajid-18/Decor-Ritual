import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "New Category | ZF Store Admin",
};

export default async function AdminNewCategoryPage() {
  await requireAdmin();
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Create Category"
        description="Add a new category to organize the product catalog."
        action={
          <Link
            href="/admin/categories"
            className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
          >
            ← Back to Categories
          </Link>
        }
      />

      <CategoryForm />
    </div>
  );
}
