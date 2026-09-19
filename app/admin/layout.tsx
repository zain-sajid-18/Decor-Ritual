import Link from "next/link";
import { AdminNav } from "@/components/admin/nav";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Admin Dashboard | ZF Store",
  description: "Catalog and taxonomy management console for ZF Store.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <div className="rounded border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
              Auth Architecture
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 block mt-0.5">
              Ready for Step 8 Auth
            </span>
          </div>

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

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              DAL Active
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
