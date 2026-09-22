import Link from "next/link";
import { AdminNav } from "@/components/admin/nav";
import { Badge } from "@/components/ui/badge";
import { getOptionalSession } from "@/lib/auth/require-admin";
import { logoutAction } from "@/lib/actions/admin/auth";

export const metadata = {
  title: "Admin Dashboard | ZF Store",
  description: "Catalog and taxonomy management console for ZF Store.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getOptionalSession();

  // If there is no active session (e.g. viewing /admin/login),
  // render the children in a clean centered container without sidebar chrome.
  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center">
        {children}
      </div>
    );
  }

  // When authenticated, render full admin dashboard layout
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Admin Brand Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                ZF Store
              </Link>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Admin Console</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              Internal
            </Badge>
          </div>

          {/* Sidebar Navigation */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block px-3 mb-2">
              Catalog Management
            </span>
            <AdminNav />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          {/* Authenticated User Info */}
          <div className="rounded border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                {session.role}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-zinc-400">Active</span>
              </span>
            </div>
            <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium block truncate" title={session.email}>
              {session.email}
            </span>
          </div>

          {/* Sign Out Form Button */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-between text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <span>Sign Out</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </form>

          <Link
            href="/"
            className="flex items-center justify-between text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>← Exit to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-zinc-200 bg-white px-4 sm:px-8 flex items-center justify-between dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Admin Console</span>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              DAL Active
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">|</span>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {session.email}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
