import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Categories | ZF Store",
  description: "Browse all curated shopping and decor categories in ZF Store.",
};

export default async function StorefrontCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <PageHeader
        title="Product Categories"
        description="Browse through our verified taxonomy of curated products."
      />

      {categories.length === 0 ? (
        <EmptyState
          title="No categories available"
          description="There are currently no active categories to display."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                    {category.name}
                  </h2>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Order #{category.displayOrder}
                  </span>
                </div>

                {category.description && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Explore products</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
