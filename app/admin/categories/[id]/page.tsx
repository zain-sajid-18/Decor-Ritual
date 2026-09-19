import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetCategoryById } from "@/lib/data/admin/categories";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/auth/require-admin";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const category = await adminGetCategoryById(id);
  return {
    title: category
      ? `Edit: ${category.name} | ZF Store Admin`
      : "Category Not Found | ZF Store Admin",
  };
}

export default async function AdminEditCategoryPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const category = await adminGetCategoryById(id);

  if (!category) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Edit Category"
        description={
          <span className="flex items-center gap-2">
            <code className="font-mono text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              {category.slug}
            </code>
            {category.isActive ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </span>
        }
        action={
          <Link
            href="/admin/categories"
            className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
          >
            ← Back to Categories
          </Link>
        }
      />

      <CategoryForm category={category} />
    </div>
  );
}
