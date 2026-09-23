"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isDbAvailable } from "@/lib/db";
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetCategoryById,
  adminGetCategoryBySlug,
  adminCountProductsInCategory,
} from "@/lib/data/admin/categories";
import { slugify, isValidSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ActionState } from "@/types/action";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

/**
 * Check if an error is Next.js's internal redirect signal.
 */
function isNextRedirect(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("digest" in error && typeof (error as { digest?: string }).digest === "string") {
    return (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");
  }
  return (error as Error).message === "NEXT_REDIRECT";
}

/**
 * Category Validation Schema
 */
const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Category name is required." })
    .trim()
    .min(1, "Category name cannot be empty."),
  slug: z
    .string({ message: "Slug is required." })
    .trim()
    .min(1, "Slug cannot be empty.")
    .transform((val) => slugify(val))
    .refine((val) => isValidSlug(val), {
      message: "Slug must contain only lowercase letters, numbers, and hyphens.",
    }),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  displayOrder: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return 0;
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed));
    }),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined))
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Image URL must be a valid URL.",
    }),
  isActive: z.boolean().default(true),
  seoTitle: z
    .string()
    .trim()
    .max(70, "SEO title must be 70 characters or fewer.")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  seoDescription: z
    .string()
    .trim()
    .max(160, "SEO description must be 160 characters or fewer.")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

/**
 * Helper to parse raw FormData into a normalized object.
 */
function parseCategoryFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    displayOrder: formData.get("sortOrder") ?? formData.get("displayOrder"),
    imageUrl: formData.get("imageUrl") || undefined,
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
  };
}

/**
 * Server Action: Create Category
 */
export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Database connection is not available. Real mutations require a configured DATABASE_URL.",
    };
  }

  const rawData = parseCategoryFormData(formData);
  const validated = CategoryFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the errors in the form.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  // Check unique slug
  try {
    const existing = await adminGetCategoryBySlug(data.slug);
    if (existing) {
      return {
        success: false,
        message: "A category with this slug already exists.",
        errors: {
          slug: ["A category with this slug already exists."],
        },
      };
    }

    const input: CreateCategoryInput = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.imageUrl,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
      seo:
        data.seoTitle || data.seoDescription
          ? { title: data.seoTitle, description: data.seoDescription }
          : undefined,
    };

    await adminCreateCategory(input);
  } catch (error) {
    if (isNextRedirect(error)) throw error;

    const errMsg = (error as Error)?.message || "";
    if (errMsg.includes("unique") || errMsg.includes("23505")) {
      return {
        success: false,
        message: "A category with this slug already exists.",
        errors: {
          slug: ["A category with this slug already exists."],
        },
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while creating the category.",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

/**
 * Server Action: Update Category
 */
export async function updateCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return {
      success: false,
      message: "Invalid category ID provided.",
    };
  }

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Database connection is not available. Real mutations require a configured DATABASE_URL.",
    };
  }

  const existingCategory = await adminGetCategoryById(id);
  if (!existingCategory) {
    return {
      success: false,
      message: "Category not found.",
    };
  }

  const rawData = parseCategoryFormData(formData);
  const validated = CategoryFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the errors in the form.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  // Check unique slug conflict with other categories
  try {
    const categoryWithSlug = await adminGetCategoryBySlug(data.slug);
    if (categoryWithSlug && categoryWithSlug.id !== id) {
      return {
        success: false,
        message: "A category with this slug already exists.",
        errors: {
          slug: ["A category with this slug already exists."],
        },
      };
    }

    const input: UpdateCategoryInput = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.imageUrl,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
      seo:
        data.seoTitle || data.seoDescription
          ? { title: data.seoTitle, description: data.seoDescription }
          : undefined,
    };

    await adminUpdateCategory(id, input);
  } catch (error) {
    if (isNextRedirect(error)) throw error;

    const errMsg = (error as Error)?.message || "";
    if (errMsg.includes("unique") || errMsg.includes("23505")) {
      return {
        success: false,
        message: "A category with this slug already exists.",
        errors: {
          slug: ["A category with this slug already exists."],
        },
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while updating the category.",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/categories");
  revalidatePath("/");
  revalidatePath(`/categories/${data.slug}`);
  if (existingCategory.slug !== data.slug) {
    revalidatePath(`/categories/${existingCategory.slug}`);
  }

  redirect("/admin/categories");
}

/**
 * Server Action: Delete Category
 * Respects ON DELETE RESTRICT: will not delete if products reference it.
 */
export async function deleteCategoryAction(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!id || typeof id !== "string") {
    return {
      success: false,
      message: "Invalid category ID provided.",
    };
  }

  if (!isDbAvailable) {
    return {
      success: false,
      message:
        "Database connection is not available. Real mutations require a configured DATABASE_URL.",
    };
  }

  try {
    const existing = await adminGetCategoryById(id);
    if (!existing) {
      return {
        success: false,
        message: "Category not found.",
      };
    }

    // Check if any products reference this category
    const productCount = await adminCountProductsInCategory(id);
    if (productCount > 0) {
      return {
        success: false,
        message: `This category cannot be deleted because ${productCount} product${productCount === 1 ? "" : "s"} ${productCount === 1 ? "is" : "are"} still assigned to it.`,
      };
    }

    const deleted = await adminDeleteCategory(id);
    if (!deleted) {
      return {
        success: false,
        message: "Failed to delete category.",
      };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath(`/categories/${existing.slug}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;

    const errMsg = (error as Error)?.message || "";
    if (errMsg.includes("23503") || errMsg.includes("foreign key") || errMsg.includes("violates foreign key")) {
      return {
        success: false,
        message: "This category cannot be deleted because products are still assigned to it.",
      };
    }

    return {
      success: false,
      message: "An error occurred while deleting the category.",
    };
  }

  redirect("/admin/categories");
}
