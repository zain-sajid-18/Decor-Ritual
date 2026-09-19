import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "New Category | ZF Store Admin",
};

export default function AdminNewCategoryPage() {
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

      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
        <strong>Architecture note:</strong> Form submission and server-side validation will be connected in the next implementation step.
      </div>

      <form
        className="space-y-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-label="Create category form"
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
                placeholder="e.g. Living Room"
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
                placeholder="e.g. living-room"
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Unique, lowercase, hyphen-separated.</p>
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
              placeholder="Brief description of this category shown to customers."
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
                placeholder="e.g. 1"
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Lower number appears first. Leave blank for auto-ordering.</p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="imageUrl" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Image URL <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="Cloudinary URL (when connected)"
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
                defaultChecked
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
              placeholder="Defaults to category name if left blank"
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
              placeholder="Defaults to description if left blank"
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </fieldset>

        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            Save Category
          </button>
          <Link
            href="/admin/categories"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
