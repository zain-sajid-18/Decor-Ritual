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
    <div className="space-y-4 pt-2">
      {/* Category Pills & Sort Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Category Navigation Pills */}
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0" 
          role="tablist" 
          aria-label="Filter products by collection"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!currentCategory}
            onClick={() => handleCategorySelect(undefined)}
            disabled={isPending}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold tracking-tight transition-all duration-200 active:scale-95 ${
              !currentCategory
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30"
                : "bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100 dark:border-stone-800 shadow-2xs"
            }`}
          >
            All Items
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
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold tracking-tight transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30"
                    : "bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100 dark:border-stone-800 shadow-2xs"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Sort and Count Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-1 lg:pt-0">
          {/* Result Count */}
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Showing <strong className="font-bold text-stone-900 dark:text-stone-100">{totalCount}</strong> {totalCount === 1 ? "object" : "curated objects"}
          </span>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold whitespace-nowrap">
              Sort:
            </span>
            <div className="relative">
              <select
                id="storefront-sort"
                value={currentSort}
                onChange={handleSortChange}
                disabled={isPending}
                className="appearance-none rounded-xl border border-stone-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-stone-800 shadow-xs transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
              >
                <option value="featured">Curator Picks</option>
                <option value="newest">Latest Additions</option>
                <option value="a-z">Title (A–Z)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-stone-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
