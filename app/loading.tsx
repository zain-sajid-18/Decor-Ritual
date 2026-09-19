export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center p-8">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"
        role="status"
        aria-label="Loading content"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
