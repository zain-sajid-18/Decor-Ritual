# Technical Architecture: ZF Store (Amazon Associates Product Discovery & Admin Platform)

**Document Version:** 2.0.0  
**Status:** Approved Architectural Blueprint  
**Project Name:** ZF Store  
**Target Environment:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Vercel  
**Primary Domain:** Curated Product Discovery & Amazon Associates Affiliate Platform  

---

## 1. Project Overview & Business Requirements

### 1.1 Business Purpose
**ZF Store** is a production-oriented, curated product discovery website monetized through the Amazon Associates Program.

ZF Store is **not** a traditional e-commerce store. It does not carry physical inventory, maintain customer shopping carts, handle customer accounts, process payments, manage order fulfillment, or manage returns. All transaction processing, shipping, customer service, and order logistics are handled entirely by Amazon.

The end-to-end customer journey is:
```text
ZF Store (Discover) ──► Product Detail ──► Outbound Amazon CTA ──► Amazon (Checkout & Fulfillment)
```

### 1.2 Two Application Pillars
The architecture supports two distinct operational areas:

```text
ZF Store
│
├── Public Website (Customer Discovery)
│   ├── Home
│   ├── Products (Catalog Browse)
│   ├── Categories
│   ├── Product Detail
│   ├── Search & Facets
│   └── Affiliate Disclosure
│
└── Admin Area (Catalog Management)
    ├── Login (Protected Admin Auth)
    ├── Dashboard (Catalog Overview & Status)
    ├── Products (Listing, Filtering, Publishing)
    ├── Add Product (Creation Form)
    ├── Edit Product (Update Form)
    └── Categories (Taxonomy Management)
```

1. **Public Website:** Provides a clean, fast, trustworthy, and minimal browsing experience allowing customers to discover curated products and transition seamlessly to Amazon.
2. **Admin Dashboard:** Enables store administrators to manage the catalog (create, edit, delete, draft, and publish products and categories) directly through an internal interface rather than requiring developers to manually edit code or static data files.

---

## 2. Architecture Decision: Layered Abstraction & Evolution

### 2.1 Layered Data Access Architecture
To enable an orderly progression from local development data to a real admin-managed database without requiring UI rewrites, the application strictly decouples presentation from data storage through an explicit **Data Access Layer (DAL)**:

```text
UI Components (Server & Client Components)
        │
        ▼
Data Access Layer (lib/data/)
        │
        ▼
Repository / Data Source Interface (lib/repositories/)
        │
        ▼
Persistence Layer (Development Seed Data ──► Future Production Database)
```

**Architectural Rules:**
- Public UI pages and components **never** directly query the database or import raw data files.
- Admin UI pages and actions communicate exclusively through the Data Access Layer / Server Actions.
- When transitioning from development seed data to a production database, only the repository implementation changes; the UI components and routing contracts remain untouched.

---

## 3. Data Architecture & Contract Definitions

### 3.1 Product Schema (`types/product.ts`)
The product model supports comprehensive catalog and editorial management without forcing arbitrary or unverified fields:

```typescript
export type ProductStatus = 'draft' | 'published' | 'archived';

export interface ProductImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  tags: string[];
  images: ProductImage[];
  
  // Status & Editorial Flags
  status: ProductStatus;
  featured: boolean;
  recommended: boolean;
  
  // Amazon Referral Integration (Supplied via real configuration)
  amazonProductUrl: string; // Destination Amazon URL
  asin?: string;            // Amazon Standard Identification Number if available
  
  // Optional Specific Attributes (Only when applicable)
  attributes?: Record<string, string>;
  
  // SEO Metadata
  seoTitle?: string;
  seoDescription?: string;

  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

*Policy Note: Fields such as static prices, fake review counts, artificial ratings, dimensions, and materials are never forced unless specifically supplied and policy-compliant.*

### 3.2 Category Schema (`types/category.ts`)
The category model organizes catalog taxonomy:

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 Data Access Layer (DAL) Contract
The DAL establishes the functional contract separating UI from storage:

#### Public Read Queries
```typescript
// lib/data/products.ts
export async function getProducts(params?: ProductQueryParams): Promise<Product[]>;
export async function getProductBySlug(slug: string): Promise<Product | null>;
export async function getProductsByCategory(categorySlug: string): Promise<Product[]>;
export async function getFeaturedProducts(limit?: number): Promise<Product[]>;
export async function getRecommendedProducts(limit?: number): Promise<Product[]>;
export async function searchProducts(query: string, filters?: ProductFilters): Promise<Product[]>;

// lib/data/categories.ts
export async function getCategories(): Promise<Category[]>;
export async function getCategoryBySlug(slug: string): Promise<Category | null>;
```

#### Admin Management Operations
```typescript
// lib/data/admin/products.ts
export async function createProduct(data: CreateProductInput): Promise<Product>;
export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product>;
export async function deleteProduct(id: string): Promise<boolean>;
export async function publishProduct(id: string): Promise<Product>;
export async function unpublishProduct(id: string): Promise<Product>;

// lib/data/admin/categories.ts
export async function createCategory(data: CreateCategoryInput): Promise<Category>;
export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category>;
export async function deleteCategory(id: string): Promise<boolean>;
```

---

## 4. Routing & Application Structure

### 4.1 Route Boundaries
The public storefront and the admin management areas are architecturally separated using distinct route boundaries and independent layout trees:

```text
Public Customer Routes:
/                           -> Homepage (Featured, Recommended, Categories)
/products                   -> Full Catalog Listing (Search, Filter, Sort)
/products/[slug]            -> Product Detail Page (Editorial & Amazon CTA)
/categories                 -> Category Directory
/categories/[slug]          -> Category Filtered View
/disclosure                 -> Amazon Associates & FTC Compliance

Admin Dashboard Routes:
/admin                      -> Admin Dashboard Overview / Redirect
/admin/login                -> Admin Authentication Login
/admin/dashboard            -> Catalog Metrics, Recent Edits & Status Overview
/admin/products             -> Product Table (Search, Filter by Status, Actions)
/admin/products/new         -> Product Creation Form
/admin/products/[id]/edit   -> Product Edit Form
/admin/categories           -> Category Management Table & Form
```

### 4.2 Independent Layout Architecture
- **Public Layout (`app/(public)/layout.tsx` or Root Layout):** Minimal navigation header, text-based ZF Store branding, category navigation, search trigger, and public footer with required affiliate disclosures.
- **Admin Layout (`app/admin/layout.tsx`):** Protected administrative shell with dedicated sidebar navigation, catalog management links, user session control, and zero customer-facing storefront chrome.

---

## 5. Visual Design Direction & Design System

### 5.1 Design Philosophy: Simple + Minimal + Professional
ZF Store rejects experimental, heavy visual trends in favor of an understated, trustworthy, product-focused aesthetic:

- **Focus:** The product itself is the visual center of attention.
- **Avoid:**
  - 3D graphics and Canvas experiments
  - Starfields, mesh gradients, or neon glows
  - Glassmorphism and backdrop blur clutter
  - Heavy or distracting animations
  - Unnecessary cards inside cards
  - Exaggerated rounded corners
  - Fake statistics, fabricated reviews, or artificial social proof
- **Embrace:**
  - Clean, legible typography with strict hierarchical scaling
  - Generous, deliberate whitespace and grid alignment
  - Subtle borders and neutral surfaces
  - Fast, intuitive, frictionless navigation
  - Clear, accessible focus states and understated hover feedback

### 5.2 Design Tokens (Tailwind CSS v4)
Configured in `app/globals.css` using `@theme inline`:

| Token | Semantic Purpose | Light Value | Dark Value |
|---|---|---|---|
| `--background` | Page canvas background | `#ffffff` | `#09090b` |
| `--foreground` | Primary body and heading text | `#09090b` | `#fafafa` |
| `--surface` | Container, card, and modal background | `#ffffff` | `#18181b` |
| `--surface-muted` | Subtle secondary backgrounds | `#f4f4f5` | `#27272a` |
| `--muted-text` | Metadata, captions, secondary labels | `#71717a` | `#a1a1aa` |
| `--border` | Structural dividers, card borders | `#e4e4e7` | `#27272a` |
| `--primary` | Primary action buttons and badges | `#18181b` | `#fafafa` |
| `--primary-foreground` | Text on primary actions | `#fafafa` | `#18181b` |
| `--destructive` | Delete, unpublish, error indicators | `#ef4444` | `#f87171` |
| `--destructive-foreground` | Text on destructive actions | `#ffffff` | `#ffffff` |
| `--radius-sm` | Minor radius (tags, badges) | `0.25rem` | `0.25rem` |
| `--radius-md` | Standard radius (buttons, inputs) | `0.375rem` | `0.375rem` |
| `--radius-lg` | Container radius (cards, panels) | `0.5rem` | `0.5rem` |

### 5.3 Typography
- Clean, modern, high-legibility sans-serif powered by `next/font/google` (Geist Sans / Geist Mono).
- No external font files or heavy typography packages.
- Strict typographical hierarchy: single `h1` per page, proportional `h2`/`h3` section headers, clear body copy.

### 5.4 Branding
- **Brand Identity:** **ZF Store**
- **Logo:** Clean, understated typographic wordmark. No complex graphical gimmicks.
- **Tone:** Objective, curated, professional, and transparent.

---

## 6. Amazon Associates Architecture & Compliance

### 6.1 Link Handling Policy
1. **Never Invent Data:** Never invent Amazon affiliate tags, fake Amazon URLs, fake ASINs, fake prices, or fake ratings.
2. **Centralized Builder:** All outbound Amazon URLs are handled through a single, controlled utility (`lib/affiliate.ts`).
3. **Link Security:** Outbound affiliate links strictly mandate:
   - `target="_blank"`
   - `rel="nofollow sponsored noopener"`
4. **FTC & Amazon Operating Agreement Compliance:**
   - Permanent, prominent affiliate disclosure on all public pages.
   - Contextual disclosure on all product detail pages adjacent to the primary CTA.
   - Dedicated legal disclosure page at `/disclosure`.

---

## 7. Database Technology Decision & Persistence Architecture

### 7.1 Chosen Database & ORM
- **Database Engine:** **PostgreSQL** (Managed via Neon, Supabase, AWS RDS, or standard PostgreSQL container).
- **ORM / Query Builder:** **Drizzle ORM** (`drizzle-orm` + `postgres` driver + `drizzle-kit`).

### 7.2 Why Drizzle ORM Was Chosen Over Prisma
1. **Zero Native Binary Overhead:**
   Unlike Prisma, which requires platform-specific binary engines (`prisma-query-engine`) that introduce friction in CI/CD, Docker, and edge runtime environments, Drizzle is 100% pure TypeScript and JavaScript.
2. **Native Turbopack & Next.js 16 / React 19 Compatibility:**
   Drizzle does not rely on a custom postinstall code generator (`prisma generate`). Schemas and relational types compile directly with TypeScript, guaranteeing instantaneous Turbopack builds and zero caching anomalies.
3. **Offline SQL Migration Generation:**
   `drizzle-kit generate` generates standard, inspectable, and auditable raw SQL migration files (`drizzle/*.sql`) completely offline without needing an active database connection.
4. **Optimal Serverless Performance:**
   The `postgres` driver paired with Drizzle offers ultra-low memory usage, rapid connection initialization, and zero cold-start penalty on serverless platforms like Vercel.

### 7.3 Migration & Development Strategy
- **Schema Single Source of Truth:** `lib/db/schema.ts` defines all tables, columns, relations, and constraints.
- **Generate Migrations:** `npm run db:generate` creates incremental standard SQL files in the `drizzle/` directory.
- **Apply Migrations:** `npm run db:migrate` applies pending SQL migrations in production or staging environments.
- **Development Fallback (Zero-Friction Offline Dev):**
  The repository layer (`lib/repositories/`) checks `process.env.DATABASE_URL`. If no database connection is configured, it seamlessly falls back to in-memory development fixtures (`lib/db/seed-data.ts`), allowing full frontend development, linting, and building without requiring a local PostgreSQL instance.

### 7.4 Admin User Authentication Requirement (Future Integration)
- For the dedicated authentication phase (Step 8), an `admin_users` table or standard NextAuth/Auth.js adapter schema (`users`, `accounts`, `sessions`) will be provisioned.
- **Security Mandate:** No hardcoded admin credentials, plain-text passwords, or default accounts are committed to the repository. Authentication will be managed via secure credential hashing (bcrypt/argon2) or OAuth email whitelisting.

---

## 8. Dependency Policy

The project maintains an ultra-lean dependency footprint:
- **Current Core:** `next` (v16.3.5), `react` / `react-dom` (v19.2.8), `tailwindcss` (v4), `@tailwindcss/postcss` (v4), `typescript` (v5), `eslint` (v9).
- **Database & Persistence:** `drizzle-orm` (^0.45.2), `postgres` (^3.4.9), `drizzle-kit` (^0.31.10, devDependency).
- **Allowed Future Additions (When Justified):**
  - `lucide-react` (for UI icons when components are built)
  - Auth.js / NextAuth (when admin authentication is activated)
- **Strictly Prohibited:**
  - Client state managers (Redux, Zustand, MobX)
  - Heavy UI component libraries (MUI, Ant Design, Chakra UI)
  - Axios or external HTTP clients
  - Heavy animation frameworks (Three.js, complex GSAP)

---

## 9. Implementation Roadmap

1. **Step 1: Architecture Blueprint (Completed)**
2. **Step 2: Clean Foundation & Baseline Setup (Completed)**
3. **Step 3: ZF Store Identity & Minimal Design Token Alignment (Completed)**
4. **Step 4: Domain Models, Database Schema & Data Access Layer (Completed)**
   - Implemented domain models (`types/product.ts`, `types/category.ts`, `types/admin.ts`).
   - Integrated PostgreSQL + Drizzle ORM schema and offline migration generator.
   - Built Repository and Data Access Layer (`lib/repositories/`, `lib/data/`) with development fixture fallback.
5. **Step 5: Public Storefront Foundation**
   - Build minimal Header, Footer, and Navigation for ZF Store.
   - Build public Homepage, Product Catalog, and Product Detail page.
6. **Step 6: Search, Filtering & Amazon Outbound CTA System**
   - Implement URL-driven search and category filtering.
   - Implement centralized Amazon CTA component with compliance attributes.
7. **Step 7: Admin Dashboard Architecture & Implementation**
   - Establish admin route group and layout.
   - Build admin product list, creation, and edit forms.
   - Connect admin forms to Data Access Layer.
8. **Step 8: Admin Authentication & Production Database Deployment**
   - Connect live PostgreSQL database and admin authentication.

---
*End of ZF Store Architecture Blueprint. Authorized for development implementation.*
