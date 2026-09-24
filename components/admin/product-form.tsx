"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/lib/actions/admin/products";
import { INITIAL_ACTION_STATE } from "@/types/action";
import type { Product, ProductImage } from "@/types/product";
import type { Category } from "@/types/category";
import { ProductImageManager } from "@/components/admin/product-image-manager";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const isEditing = Boolean(product);
  const actionToUse = isEditing
    ? updateProductAction.bind(null, product!.id)
    : createProductAction;

  const [state, formAction, isPending] = useActionState(actionToUse, INITIAL_ACTION_STATE);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Client-friendly auto-slug & image upload states
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(product?.slug));
  const [tempId] = useState(() => "new-" + Math.random().toString(36).substring(2, 9));
  const [pendingImages, setPendingImages] = useState<ProductImage[]>(product?.images ?? []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleDelete = () => {
    if (!product) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (!res.success && res.message) {
        setDeleteError(res.message);
        setShowDeleteConfirm(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Level Error Alert */}
      {state.message && !state.success && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
        >
          <div className="flex items-center gap-2 font-medium">
            <svg className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span>{state.message}</span>
          </div>
        </div>
      )}

      {/* Delete Error Alert */}
      {deleteError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
        >
          <div className="flex items-center gap-2 font-medium">
            <svg className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <span>{deleteError}</span>
          </div>
        </div>
      )}

      <form
        action={formAction}
        className="space-y-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-label={isEditing ? "Edit product form" : "Create product form"}
      >
        {/* Hidden field to submit pending images for new products */}
        <input type="hidden" name="images" value={JSON.stringify(pendingImages)} />

        {/* 1. Basic Details */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            1. Product Information
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
                defaultValue={product?.title ?? ""}
                onChange={handleTitleChange}
                placeholder="e.g. Modern Minimalist Desk Lamp"
                className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                  state.errors?.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
                }`}
              />
              {state.errors?.title && (
                <p className="text-xs text-red-500 font-medium">{state.errors.title[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Web Address / Slug <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                value={slug}
                onChange={handleSlugChange}
                placeholder="e.g. modern-minimalist-desk-lamp"
                className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                  state.errors?.slug
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
                }`}
              />
              {state.errors?.slug ? (
                <p className="text-xs text-red-500 font-medium">{state.errors.slug[0]}</p>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Auto-generated from title. Creates the link: /products/<strong>{slug || "your-slug"}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category <span className="text-red-500" aria-label="required">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                defaultValue={product?.categoryId ?? ""}
                className={`flex h-9 w-full appearance-none rounded-md border px-3 py-1 text-sm text-zinc-900 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                  state.errors?.categoryId
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
                }`}
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={!cat.isActive && cat.id !== product?.categoryId}
                  >
                    {cat.name}
                    {!cat.isActive ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
              {state.errors?.categoryId && (
                <p className="text-xs text-red-500 font-medium">{state.errors.categoryId[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="brand" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Brand <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                defaultValue={product?.brand ?? ""}
                placeholder="e.g. Lumina Studio"
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
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
              defaultValue={product?.shortDescription ?? ""}
              placeholder="A short summary of the product shown on product cards."
              className={`flex w-full rounded-md border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                state.errors?.shortDescription
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
              }`}
            />
            {state.errors?.shortDescription && (
              <p className="text-xs text-red-500 font-medium">{state.errors.shortDescription[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Detailed Description <span className="text-red-500" aria-label="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              defaultValue={product?.description ?? ""}
              placeholder="Comprehensive details, features, and specs shown on the product page."
              className={`flex w-full rounded-md border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                state.errors?.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
              }`}
            />
            {state.errors?.description && (
              <p className="text-xs text-red-500 font-medium">{state.errors.description[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tags" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Tags <span className="text-zinc-400 font-normal">(Optional, comma-separated)</span>
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              defaultValue={product?.tags ? product.tags.join(", ") : ""}
              placeholder="e.g. lighting, minimalist, bedroom"
              className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </fieldset>

        {/* 2. Amazon Product Link */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            2. Amazon Destination Link
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
              defaultValue={product?.amazonUrl ?? ""}
              placeholder="https://www.amazon.com/dp/B0XXXXXXXX"
              className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                state.errors?.amazonUrl
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
              }`}
            />
            {state.errors?.amazonUrl ? (
              <p className="text-xs text-red-500 font-medium">{state.errors.amazonUrl[0]}</p>
            ) : (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Paste any regular Amazon product link. Affiliate tracking is automatically managed.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="asin" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Amazon Product ID (ASIN) <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              id="asin"
              name="asin"
              type="text"
              maxLength={10}
              defaultValue={product?.asin ?? ""}
              placeholder="e.g. B08N5WRWNW"
              className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm font-mono uppercase text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                state.errors?.asin
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
              }`}
            />
            {state.errors?.asin && (
              <p className="text-xs text-red-500 font-medium">{state.errors.asin[0]}</p>
            )}
          </div>
        </fieldset>

        {/* 3. Product Photos */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            3. Product Photos
          </legend>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Upload product photos directly. The first photo will be used as the primary cover picture on your storefront.
          </p>

          <ProductImageManager
            productId={isEditing && product ? product.id : tempId}
            initialImages={isEditing && product ? product.images : []}
            isNewProduct={!isEditing}
            onImagesChange={setPendingImages}
          />
        </fieldset>

        {/* 4. Visibility & Placement */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800 w-full">
            4. Storefront Visibility
          </legend>

          <div className="space-y-1.5">
            <label htmlFor="status" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Publishing Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product?.status ?? "published"}
              className="flex h-9 w-48 appearance-none rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="published">Published (Visible)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="archived">Archived (Retired)</option>
            </select>
            {state.errors?.status && (
              <p className="text-xs text-red-500 font-medium">{state.errors.status[0]}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-5 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600"
              />
              <div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Featured Item</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Highlighted on the top of the homepage</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="recommended"
                name="recommended"
                defaultChecked={product?.recommended ?? false}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600"
              />
              <div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Recommended Badge</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Shows an editor recommended badge</p>
              </div>
            </label>
          </div>
        </fieldset>

        {/* 5. Optional SEO Overrides (Collapsible for Clean Look) */}
        <details className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
          <summary className="cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between select-none">
            <span>5. Search Engine Settings (Optional SEO)</span>
            <span className="text-[11px] text-zinc-400 font-normal group-open:hidden">Click to expand</span>
          </summary>

          <div className="mt-4 space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1.5">
              <label htmlFor="seoTitle" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Google Page Title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                type="text"
                maxLength={70}
                defaultValue={product?.seo?.title ?? ""}
                placeholder="Leave blank to use the product title automatically"
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              {state.errors?.seoTitle && (
                <p className="text-xs text-red-500 font-medium">{state.errors.seoTitle[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="seoDescription" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Custom Google Description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                rows={2}
                maxLength={160}
                defaultValue={product?.seo?.description ?? ""}
                placeholder="Leave blank to use the short description automatically"
                className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              {state.errors?.seoDescription && (
                <p className="text-xs text-red-500 font-medium">{state.errors.seoDescription[0]}</p>
              )}
            </div>
          </div>
        </details>

        {/* Audit Info in Edit Mode */}
        {product && (
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
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            disabled={isPending || isDeleting}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            {isPending
              ? isEditing
                ? "Saving changes..."
                : "Creating product..."
              : isEditing
              ? "Save Changes"
              : "Create Product"}
          </button>

          {isEditing && product && (
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Preview on Store →
            </Link>
          )}

          <Link
            href="/admin/products"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cancel
          </Link>

          {isEditing && (
            <>
              <span className="flex-1" />
              <button
                type="button"
                disabled={isPending || isDeleting}
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete Product
              </button>
            </>
          )}
        </div>
      </form>

      {/* Confirmation Modal for Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Delete Product
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">{product?.title}</strong>?
              This will permanently delete the product and its uploaded images. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
