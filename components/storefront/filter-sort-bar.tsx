"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/category";
import type { ProductSortOption } from "@/types/product";

interface FilterSortBarProps {
  categories: Category[];
  currentCategory?: string;
  currentSort?: ProductSortOption;
  totalCount: number;
}

export function FilterSortBar({
  categories,
  currentCategory,
  currentSort = "featured",
  totalCount,
}: FilterSortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Any filter or sort change resets to page 1
    params.delete("page");

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleCategorySelect = (slug?: string) => {
    updateParam("category", slug);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ProductSortOption;
    updateParam("sort", value === "featured" ? undefined : value);
  };

  return (
    <div className="space-y-4">
      {/* Category Pills and Sort Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            role="tab"
            aria-selected={!currentCategory}
            onClick={() => handleCategorySelect(undefined)}
            disabled={isPending}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              !currentCategory
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            All Products
          </button>

          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategorySelect(cat.slug)}
                disabled={isPending}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Sort and Count Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          {/* Result Count */}
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {totalCount} {totalCount === 1 ? "product" : "products"}
          </span>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="storefront-sort" className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Sort by:
            </label>
            <select
              id="storefront-sort"
              value={currentSort}
              onChange={handleSortChange}
              disabled={isPending}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="a-z">A to Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
