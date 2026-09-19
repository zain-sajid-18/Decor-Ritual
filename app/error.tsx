"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Foundational error handler (extensible for monitoring services)
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          An unexpected error occurred while loading this page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
