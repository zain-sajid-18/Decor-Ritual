import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Page Not Found
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The requested page could not be found or has been relocated.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
