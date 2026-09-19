import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetProductById } from "@/lib/data/admin/products";
import { adminGetCategories } from "@/lib/data/admin/categories";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/require-admin";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await adminGetProductById(id);
  return {
    title: product ? `Edit: ${product.title} | ZF Store Admin` : "Product Not Found | ZF Store Admin",
  };
}

export default async function AdminEditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    adminGetProductById(id),
    adminGetCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Edit Product"
        description={
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{product.id}</span>
            {product.status === "published" && <Badge variant="success">Published</Badge>}
            {product.status === "draft" && <Badge variant="secondary">Draft</Badge>}
            {product.status === "archived" && <Badge variant="outline">Archived</Badge>}
          </span>
        }
        action={
          <Link
            href="/admin/products"
            className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
          >
            ← Back to Products
          </Link>
        }
      />

      <ProductForm product={product} categories={categories} />
    </div>
  );
}
