import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();

    // Preserve other search parameters
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && typeof value === "string" && value) {
        params.set(key, value);
      }
    }

    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    }

    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  };

  // Generate page numbers array (with truncation if many pages)
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1.5 pt-10"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          aria-label="Previous page"
        >
          ← Prev
        </Link>
      ) : (
        <span
          className="inline-flex h-10 items-center justify-center rounded-xl border border-stone-100 bg-stone-50 px-3.5 text-xs font-medium text-stone-300 dark:border-stone-800/40 dark:bg-stone-900/40 dark:text-stone-600 cursor-not-allowed"
          aria-disabled="true"
        >
          ← Prev
        </span>
      )}

      {/* Numbered Page Buttons */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-xs text-stone-400 dark:text-stone-600"
              >
                …
              </span>
            );
          }

          const isCurrent = page === currentPage;

          return isCurrent ? (
            <span
              key={page}
              aria-current="page"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-xs font-bold text-white shadow-sm ring-2 ring-amber-500/20"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          aria-label="Next page"
        >
          Next →
        </Link>
      ) : (
        <span
          className="inline-flex h-10 items-center justify-center rounded-xl border border-stone-100 bg-stone-50 px-3.5 text-xs font-medium text-stone-300 dark:border-stone-800/40 dark:bg-stone-900/40 dark:text-stone-600 cursor-not-allowed"
          aria-disabled="true"
        >
          Next →
        </span>
      )}
    </nav>
  );
}
