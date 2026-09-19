import Link from "next/link";
import { adminGetProducts } from "@/lib/data/admin/products";
import { adminGetCategories } from "@/lib/data/admin/categories";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Products | ZF Store Admin",
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    adminGetProducts(),
    adminGetCategories(),
  ]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        description={`${products.length} total records — all statuses visible to admin.`}
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            + New Product
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to begin building the catalog."
          action={
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              + New Product
            </Link>
          }
        />
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                    Flags
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {product.title}
                      </div>
                      {product.brand && (
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {product.brand}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {categoryMap[product.categoryId] || product.categoryId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.status === "published" && (
                        <Badge variant="success">Published</Badge>
                      )}
                      {product.status === "draft" && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {product.status === "archived" && (
                        <Badge variant="outline">Archived</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {product.featured && (
                          <Badge variant="warning" className="text-[10px]">
                            Featured
                          </Badge>
                        )}
                        {product.recommended && (
                          <Badge variant="secondary" className="text-[10px]">
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener"
                          className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center justify-center rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
