"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchInputProps {
  initialQuery?: string;
  placeholder?: string;
}

export function SearchInput({
  initialQuery = "",
  placeholder = "Search products by title, brand, or tag...",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    const trimmed = query.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    // Reset to page 1 on new search
    params.delete("page");

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 dark:text-zinc-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search products"
          className="block w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-20 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm transition-colors focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
        />

        {/* Action buttons inside input */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1.5">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? "..." : "Search"}
          </button>
        </div>
      </div>
    </form>
  );
}
