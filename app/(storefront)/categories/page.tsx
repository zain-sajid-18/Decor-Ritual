import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/data/categories";
import { EmptyState } from "@/components/ui/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | ZF Store",
  description: "Browse curated design collections and home decor categories in ZF Store.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Collections | ZF Store",
    description: "Browse curated design collections and home decor categories in ZF Store.",
    url: "/categories",
    siteName: "ZF Store",
    type: "website",
  },
};

export default async function StorefrontCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-stone-200/80 pb-8 dark:border-stone-800">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-3.5 py-1 text-xs font-semibold tracking-wide uppercase text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300 mb-3">
          Curated Taxonomy
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          Collections & Environments
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          Explore our thoughtfully curated collections of sculptural furniture, warm ambient lighting, and tactile living accents.
        </p>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No collections available"
          description="There are currently no active collections to display."
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col rounded-3xl border border-stone-200/80 bg-white dark:bg-stone-900 dark:border-stone-800 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-400/50"
            >
              {/* Category Visual Banner */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/20">
                    <span className="text-2xl font-bold text-amber-600">{category.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 drop-shadow-sm">
                    Collection
                  </span>
                  <h2 className="text-lg font-bold text-white drop-shadow-sm">
                    {category.name}
                  </h2>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-6">
                {category.description && (
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed mb-4">
                    {category.description}
                  </p>
                )}

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 transition-colors">
                  <span>Explore Objects</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
