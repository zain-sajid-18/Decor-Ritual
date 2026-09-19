import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetCategoryById } from "@/lib/data/admin/categories";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

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

      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
        <strong>Architecture note:</strong> Form submission and server-side mutations will be connected in the next implementation step.
      </div>

      <form
        className="space-y-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-label="Edit category form"
      >
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            Category Details
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={category.name}
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Slug <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                defaultValue={category.slug}
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Changing slug will break existing public URLs.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Description <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={category.description ?? ""}
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="sortOrder" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Sort Order <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={category.displayOrder ?? ""}
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="imageUrl" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Image URL <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={category.image ?? ""}
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={category.isActive}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600"
              />
              <div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Active</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Inactive categories are hidden from the public storefront.</p>
              </div>
            </label>
          </div>
        </fieldset>

        {/* SEO */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            SEO Metadata <span className="text-zinc-400 font-normal text-xs">(Optional overrides)</span>
          </legend>

          <div className="space-y-1.5">
            <label htmlFor="seoTitle" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              SEO Title
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              type="text"
              maxLength={70}
              defaultValue={category.seo?.title ?? ""}
              placeholder="Defaults to category name"
              className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="seoDescription" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              SEO Description
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              maxLength={160}
              defaultValue={category.seo?.description ?? ""}
              placeholder="Defaults to description"
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </fieldset>

        {/* Audit Info */}
        <div className="rounded border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              <dt className="font-semibold text-zinc-700 dark:text-zinc-300">Created</dt>
              <dd>{new Date(category.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-700 dark:text-zinc-300">Last Updated</dt>
              <dd>{new Date(category.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            Save Changes
          </button>
          <Link
            href={`/categories/${category.slug}`}
            target="_blank"
            rel="noopener"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Preview →
          </Link>
          <span className="flex-1" />
          <button
            type="button"
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete Category
          </button>
        </div>
      </form>
    </div>
  );
}
