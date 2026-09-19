import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

/**
 * DEVELOPMENT FIXTURES ONLY
 * 
 * IMPORTANT:
 * These records are strictly for local development, schema validation, and integration tests.
 * They are intentionally fictional and must NEVER be used in production or treated as real Amazon products.
 * Do not add real affiliate tags, real ASINs, fake prices, or fake reviews.
 */

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-fixture-1",
    name: "Sample Category One",
    slug: "sample-category-one",
    description: "Development fixture category for testing taxonomy and filtering.",
    image: "/images/fixtures/category-1.svg",
    isActive: true,
    displayOrder: 1,
    seo: {
      title: "Sample Category One | ZF Store Fixture",
      description: "Development fixture category for test environments.",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-fixture-2",
    name: "Sample Category Two",
    slug: "sample-category-two",
    description: "Development fixture category for testing multi-category listings.",
    image: "/images/fixtures/category-2.svg",
    isActive: true,
    displayOrder: 2,
    seo: {
      title: "Sample Category Two | ZF Store Fixture",
      description: "Development fixture category for test environments.",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-fixture-3",
    name: "Sample Category Three (Inactive)",
    slug: "sample-category-three-inactive",
    description: "Development fixture inactive category for admin testing.",
    isActive: false,
    displayOrder: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-fixture-1",
    title: "Sample Product One",
    slug: "sample-product-one",
    brand: "Sample Brand A",
    shortDescription: "Development fixture item used for architecture and query validation.",
    description: "Detailed description text for Sample Product One development fixture.",
    categoryId: "cat-fixture-1",
    categorySlug: "sample-category-one",
    tags: ["fixture", "sample", "featured"],
    images: [
      {
        id: "img-fixture-1-1",
        url: "/images/fixtures/placeholder-1.svg",
        alt: "Sample Product One primary fixture image",
        sortOrder: 0,
      },
    ],
    featured: true,
    recommended: true,
    status: "published",
    amazonUrl: "https://example.com/mock-destination-url-1",
    seo: {
      title: "Sample Product One | ZF Store",
      description: "Sample Product One metadata fixture.",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prod-fixture-2",
    title: "Sample Product Two",
    slug: "sample-product-two",
    brand: "Sample Brand B",
    shortDescription: "Development fixture item used for category listing verification.",
    description: "Detailed description text for Sample Product Two development fixture.",
    categoryId: "cat-fixture-1",
    categorySlug: "sample-category-one",
    tags: ["fixture", "sample"],
    images: [
      {
        id: "img-fixture-2-1",
        url: "/images/fixtures/placeholder-2.svg",
        alt: "Sample Product Two primary fixture image",
        sortOrder: 0,
      },
    ],
    featured: false,
    recommended: true,
    status: "published",
    amazonUrl: "https://example.com/mock-destination-url-2",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "prod-fixture-3",
    title: "Sample Product Three",
    slug: "sample-product-three",
    brand: "Sample Brand A",
    shortDescription: "Development fixture item assigned to category two.",
    description: "Detailed description text for Sample Product Three development fixture.",
    categoryId: "cat-fixture-2",
    categorySlug: "sample-category-two",
    tags: ["fixture", "sample", "featured"],
    images: [
      {
        id: "img-fixture-3-1",
        url: "/images/fixtures/placeholder-3.svg",
        alt: "Sample Product Three primary fixture image",
        sortOrder: 0,
      },
    ],
    featured: true,
    recommended: false,
    status: "published",
    amazonUrl: "https://example.com/mock-destination-url-3",
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
  {
    id: "prod-fixture-4",
    title: "Sample Product Four (Draft)",
    slug: "sample-product-four-draft",
    shortDescription: "Development fixture item in draft status for admin testing.",
    description: "Detailed description text for draft status product fixture.",
    categoryId: "cat-fixture-2",
    categorySlug: "sample-category-two",
    tags: ["fixture", "draft"],
    images: [],
    featured: false,
    recommended: false,
    status: "draft",
    amazonUrl: "https://example.com/mock-destination-url-4",
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-01-04T00:00:00.000Z",
  },
];
