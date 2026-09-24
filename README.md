# ZF Store 🛋️

> A premium product discovery platform built with **Next.js, PostgreSQL, Drizzle ORM, and Cloudinary**, combining a curated storefront with a secure admin management system.

## Overview

**ZF Store** is a modern e-commerce-style platform designed around **curated product discovery** rather than traditional checkout.

Visitors can explore products through a clean editorial-style storefront, browse categories, view detailed product information, and follow affiliate links to purchase products from external marketplaces such as Amazon.

The platform also includes a dedicated admin dashboard for managing products, categories, inventory information, and product imagery.

---

## ✨ Key Features

### 🛍️ Curated Product Discovery

* Editorial-style product browsing experience
* Product categories and curated collections
* Detailed product pages
* Responsive design across desktop and mobile
* Dark and light theme support
* Clean, minimal visual language

### 🔗 Amazon Affiliate Integration

* Affiliate-ready outbound product links
* Automatic Amazon Associate tag injection
* Product discovery without maintaining an internal checkout system
* External purchase flow handled by the marketplace

### 🖼️ Cloudinary Image Management

* Cloud-based product image storage
* Image upload directly from the admin dashboard
* Drag-and-drop image management
* Optimized delivery through Cloudinary

### ⚙️ Admin Dashboard

* Secure admin authentication
* Product CRUD operations
* Category management
* Product publishing controls
* Inventory management
* Product image management
* Dedicated administrative interface separate from the public storefront

### 🔎 SEO & Discoverability

* Dynamic sitemap
* Robots configuration
* Dynamic metadata
* Open Graph metadata
* Twitter/X cards
* SEO-friendly product and category pages

### 🔐 Security

* JWT-based authentication
* Protected admin routes
* Server-side handling of sensitive credentials
* Content Security Policy and security headers
* Admin interface isolated from the public storefront
* Cloudinary API secret never exposed to the client

---

## 🏗️ Architecture

The application is organized around two primary areas:

```text
                      ZF Store
                         │
            ┌────────────┴────────────┐
            │                         │
       Public Storefront         Admin Dashboard
            │                         │
     Product Discovery        Product Management
     Categories               Categories
     Product Pages            Images
     Affiliate Links          Inventory
            │                         │
            └────────────┬────────────┘
                         │
                  Data Access Layer
                         │
              ┌──────────┴──────────┐
              │                     │
        PostgreSQL              Cloudinary
         Database              Image Storage
```

### Public Storefront

The public-facing application handles product discovery and presentation.

```text
User
 │
 ▼
Storefront
 │
 ├── Categories
 ├── Product Listing
 ├── Product Details
 └── Affiliate Link
          │
          ▼
     External Marketplace
```

### Admin System

The administrative side provides controlled access to product management.

```text
Admin
 │
 ▼
Authentication
 │
 ▼
Protected Dashboard
 │
 ├── Products
 ├── Categories
 ├── Inventory
 └── Images
          │
          ▼
     Database / Cloudinary
```

---

## 🧱 Tech Stack

| Layer            | Technology         |
| ---------------- | ------------------ |
| Framework        | Next.js 16         |
| Language         | TypeScript         |
| Frontend         | React              |
| Styling          | Tailwind CSS v4    |
| Database         | PostgreSQL         |
| Database Hosting | Neon               |
| ORM              | Drizzle ORM        |
| Authentication   | JWT / jose         |
| Image Management | Cloudinary         |
| Deployment       | Vercel             |
| Architecture     | Next.js App Router |

---

## 📁 Project Structure

```text
decor-ritual/
│
├── app/
│   ├── (storefront)/       # Public storefront routes
│   └── admin/              # Protected admin dashboard
│
├── components/
│   ├── storefront/         # Storefront components
│   ├── admin/              # Admin components
│   └── ui/                 # Shared UI primitives
│
├── lib/
│   ├── actions/            # Server actions
│   ├── auth/               # Authentication & sessions
│   ├── data/               # Public data-access layer
│   ├── db/                 # Database client & schema
│   └── repositories/       # Admin data-access layer
│
├── proxy.ts                # Route protection
├── next.config.ts          # Next.js configuration
└── package.json
```

---

## 🔄 Core Product Flow

### Product Discovery

```text
Browse
   ↓
Category / Collection
   ↓
Product
   ↓
Product Details
   ↓
Affiliate Link
   ↓
External Marketplace
```

### Product Management

```text
Admin Login
    ↓
Dashboard
    ↓
Create / Edit Product
    ↓
Upload Images
    ↓
Configure Product
    ↓
Publish
    ↓
Available on Storefront
```

---

## 🗄️ Data Layer

The project separates application logic from direct database access through dedicated data-access and repository layers.

```text
UI
 │
 ▼
Server Actions / Data Functions
 │
 ▼
Data Access Layer
 │
 ▼
Repositories
 │
 ▼
Drizzle ORM
 │
 ▼
PostgreSQL
```

This structure keeps database operations isolated and makes the application easier to maintain and extend.

---

## 🔐 Security Architecture

Security is handled at multiple levels:

* Protected administrative routes
* JWT-based session authentication
* Server-side secret management
* HTTP security headers
* Content Security Policy
* HSTS
* X-Frame-Options
* Sensitive Cloudinary credentials restricted to the server
* Public storefront separated from administrative functionality

The administrative interface is intentionally not exposed as a primary navigation element within the public storefront.

---

## 🚀 Running Locally

### Requirements

* Node.js 20+
* PostgreSQL database
* Cloudinary account

### Installation

```bash
git clone <repository-url>

cd decor-ritual

npm install
```

Create your environment configuration based on the project's environment template, then initialize the database:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

> Environment variables and deployment credentials are intentionally not included in this repository.

---

## 🌐 Deployment

The application is designed for deployment on **Vercel** with:

* Neon PostgreSQL for database hosting
* Cloudinary for image management
* Vercel for application hosting

Production secrets and environment variables should be configured through the deployment platform rather than committed to the repository.

---

## 🎯 Project Goals

ZF Store was designed around a few core principles:

* **Curated over clutter** — focus on useful product discovery rather than overwhelming catalogs.
* **Minimal over excessive** — keep the interface clean and product-focused.
* **Separation of concerns** — isolate presentation, data access, and administrative functionality.
* **Scalable foundations** — structure the application so additional product and commerce functionality can be introduced later.
* **SEO-first discovery** — make products and categories accessible to search engines.
* **Secure administration** — keep management functionality isolated from the public experience.

---

## 📌 Project Status

**Active development**

The platform's core storefront, administration, database, authentication, image management, and affiliate architecture are in place, with further improvements and refinements planned.

---

## 👨‍💻 Built With

**Next.js · React · TypeScript · PostgreSQL · Drizzle ORM · Neon · Cloudinary · Tailwind CSS · Vercel**
