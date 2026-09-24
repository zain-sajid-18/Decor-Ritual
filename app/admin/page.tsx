import Link from "next/link";
import { adminGetProducts } from "@/lib/data/admin/products";
import { adminGetCategories } from "@/lib/data/admin/categories";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "Dashboard | ZF Store Admin",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [products, categories] = await Promise.all([
    adminGetProducts(),
    adminGetCategories(),
  ]);

  const publishedCount = products.filter((p) => p.status === "published").length;
  const draftCount = products.filter((p) => p.status === "draft").length;
  const archivedCount = products.filter((p) => p.status === "archived").length;
  const activeCategories = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome! Here you can manage your products, categories, and track your store at a glance."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              + Add Product
            </Link>
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              + Add Category
            </Link>
          </div>
        }
      />

      {/* Real Structural Catalog Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Products Count Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Products
            </span>
            <Link
              href="/admin/products"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {products.length}
            </span>
            <span className="text-xs text-zinc-500">products</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <Badge variant="success">{publishedCount} Published</Badge>
            <Badge variant="secondary">{draftCount} Draft</Badge>
            {archivedCount > 0 && <Badge variant="outline">{archivedCount} Archived</Badge>}
          </div>
        </div>

        {/* Categories Count Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Categories
            </span>
            <Link
              href="/admin/categories"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline"
            >
              View list →
            </Link>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {categories.length}
            </span>
            <span className="text-xs text-zinc-500">categories</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <Badge variant="success">{activeCategories} Active</Badge>
            {categories.length - activeCategories > 0 && (
              <Badge variant="secondary">
                {categories.length - activeCategories} Inactive
              </Badge>
            )}
          </div>
        </div>

        {/* Live Store Preview */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Live Store
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Store is live" />
          </div>
          <div className="mt-3">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Your Store is Live
            </span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              View your storefront as customers see it.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300 underline hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Open Storefront →
            </Link>
          </div>
        </div>
      </div>

      {/* Product Publishing Workflow Guide */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          How Product Status Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Draft</Badge>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hidden from visitors. Use this while you are still adding details or photos.
            </p>
          </div>

          <div className="p-3.5 rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="success">Published</Badge>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Visible to all customers on the store. The product appears in search and category pages.
            </p>
          </div>

          <div className="p-3.5 rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Archived</Badge>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hidden from the store but safely kept in your records. Useful for seasonal or discontinued items.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="group rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
            Manage Products →
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Add, edit, and publish products. Control which items appear on the store.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="group rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
            Manage Categories →
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Create and organise the categories shown in the store&apos;s top menu.
          </p>
        </Link>
      </div>
    </div>
  );
}
