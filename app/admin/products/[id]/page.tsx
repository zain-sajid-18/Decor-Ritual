import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetProductById } from "@/lib/data/admin/products";
import { adminGetCategories } from "@/lib/data/admin/categories";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await adminGetProductById(id);
  return {
    title: product ? `Edit: ${product.title} | ZF Store Admin` : "Product Not Found | ZF Store Admin",
  };
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    adminGetProductById(id),
    adminGetCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Edit Product"
        description={
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{product.id}</span>
            {product.status === "published" && <Badge variant="success">Published</Badge>}
            {product.status === "draft" && <Badge variant="secondary">Draft</Badge>}
            {product.status === "archived" && <Badge variant="outline">Archived</Badge>}
          </span>
        }
        action={
          <Link
            href="/admin/products"
            className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
          >
            ← Back to Products
          </Link>
        }
      />

      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
        <strong>Architecture note:</strong> Form submission and server-side mutations will be connected in the next implementation step. All fields are pre-populated with current values.
      </div>

      <form
        className="space-y-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-label="Edit product form"
      >
        {/* Core Product Information */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            Core Product Information
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Product Title <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={product.title}
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
                defaultValue={product.slug}
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="brand" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Brand <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              defaultValue={product.brand ?? ""}
              className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Category <span className="text-red-500" aria-label="required">*</span>
            </label>
            <select
              id="category"
              name="categoryId"
              required
              defaultValue={product.categoryId}
              className="flex h-9 w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} disabled={!cat.isActive && cat.id !== product.categoryId}>
                  {cat.name}{!cat.isActive ? " (Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="shortDescription" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Short Description <span className="text-red-500" aria-label="required">*</span>
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={2}
              required
              defaultValue={product.shortDescription}
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Full Description <span className="text-red-500" aria-label="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              defaultValue={product.description}
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tags" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Tags <span className="text-zinc-400 font-normal">(comma-separated)</span>
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              defaultValue={product.tags.join(", ")}
              className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </fieldset>

        {/* Amazon Affiliate Configuration */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            Amazon Affiliate Configuration
          </legend>

          <div className="space-y-1.5">
            <label htmlFor="amazonUrl" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Amazon Product URL <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              id="amazonUrl"
              name="amazonUrl"
              type="url"
              required
              defaultValue={product.amazonUrl}
              className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="asin" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              ASIN <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              id="asin"
              name="asin"
              type="text"
              maxLength={10}
              defaultValue={product.asin ?? ""}
              className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-mono text-zinc-900 uppercase placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </fieldset>

        {/* Publishing & Editorial Flags */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            Publishing & Editorial Flags
          </legend>

          <div className="space-y-1.5">
            <label htmlFor="status" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Publication Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              className="flex h-9 w-48 appearance-none rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                defaultChecked={product.featured}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600"
              />
              <div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Featured</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Shown in homepage featured section</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="recommended"
                name="recommended"
                defaultChecked={product.recommended}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600"
              />
              <div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Recommended</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Highlighted in recommended section</p>
              </div>
            </label>
          </div>
        </fieldset>

        {/* SEO Overrides */}
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
              defaultValue={product.seo?.title ?? ""}
              placeholder="Defaults to product title"
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
              defaultValue={product.seo?.description ?? ""}
              placeholder="Defaults to short description"
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </fieldset>

        {/* Audit Info */}
        <div className="rounded border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              <dt className="font-semibold text-zinc-700 dark:text-zinc-300">Created</dt>
              <dd>{new Date(product.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-700 dark:text-zinc-300">Last Updated</dt>
              <dd>{new Date(product.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            Save Changes
          </button>
          <Link
            href={`/products/${product.slug}`}
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
            Delete Product
          </button>
        </div>
      </form>
    </div>
  );
}
