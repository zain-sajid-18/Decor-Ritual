"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/admin/categories";
import { INITIAL_ACTION_STATE } from "@/types/action";
import type { Category } from "@/types/category";

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const isEditing = Boolean(category);
  const actionToUse = isEditing
    ? updateCategoryAction.bind(null, category!.id)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState(actionToUse, INITIAL_ACTION_STATE);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    if (!category) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteCategoryAction(category.id);
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
        aria-label={isEditing ? "Edit category form" : "Create category form"}
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
                defaultValue={category?.name ?? ""}
                placeholder="e.g. Living Room"
                className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                  state.errors?.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
                }`}
              />
              {state.errors?.name && (
                <p className="text-xs text-red-500 font-medium">{state.errors.name[0]}</p>
              )}
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
                defaultValue={category?.slug ?? ""}
                placeholder="e.g. living-room"
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
                  Unique, lowercase, hyphen-separated.
                </p>
              )}
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
              defaultValue={category?.description ?? ""}
              placeholder="Brief description of this category shown to customers."
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
                defaultValue={category?.displayOrder ?? ""}
                placeholder="e.g. 1"
                className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                  state.errors?.displayOrder
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
                }`}
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Lower number appears first. Leave blank for auto-ordering.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="imageUrl" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Image URL <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={category?.image ?? ""}
                placeholder="https://example.com/image.jpg"
                className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                  state.errors?.imageUrl
                    ? "border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700"
                }`}
              />
              {state.errors?.imageUrl && (
                <p className="text-xs text-red-500 font-medium">{state.errors.imageUrl[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={category?.isActive ?? true}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600"
              />
              <div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Active</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Inactive categories are hidden from the public storefront.
                </p>
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
              defaultValue={category?.seo?.title ?? ""}
              placeholder="Defaults to category name if left blank"
              className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {state.errors?.seoTitle && (
              <p className="text-xs text-red-500 font-medium">{state.errors.seoTitle[0]}</p>
            )}
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
              defaultValue={category?.seo?.description ?? ""}
              placeholder="Defaults to description if left blank"
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {state.errors?.seoDescription && (
              <p className="text-xs text-red-500 font-medium">{state.errors.seoDescription[0]}</p>
            )}
          </div>
        </fieldset>

        {/* Audit Info in Edit Mode */}
        {category && (
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
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            disabled={isPending || isDeleting}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            {isPending
              ? isEditing
                ? "Saving changes..."
                : "Creating category..."
              : isEditing
              ? "Save Changes"
              : "Create Category"}
          </button>

          {isEditing && category && (
            <Link
              href={`/categories/${category.slug}`}
              target="_blank"
              rel="noopener"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Preview →
            </Link>
          )}

          <Link
            href="/admin/categories"
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
                Delete Category
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
              Delete Category
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">{category?.name}</strong>?
              If products are assigned to this category, deletion will be blocked to maintain data integrity.
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
