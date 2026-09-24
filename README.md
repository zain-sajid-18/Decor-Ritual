# Decor Ritual 🛋️

A premium home décor e-commerce storefront with curated product discovery, built with Next.js 16, Neon PostgreSQL, Drizzle ORM, and Cloudinary.

---

## ✨ Features

- **Premium storefront** — Editorial-style product pages with dark/light mode
- **Admin dashboard** — Full CRUD for products, categories, and inventory
- **Amazon affiliate integration** — Automatic tag injection on outbound links
- **Image management** — Cloudinary upload with drag-and-drop in admin
- **SEO-ready** — Dynamic sitemap, robots.txt, Open Graph & Twitter cards
- **Secure** — JWT session auth, CSP headers, admin-only middleware

---

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub

Make sure your project is pushed to a GitHub repository.

### Step 2 — Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your repo
3. Vercel auto-detects Next.js — no framework config needed
4. Click **Deploy** (it will fail on first run — that's expected, you need env vars first)

### Step 3 — Add Environment Variables

In Vercel → **Project Settings → Environment Variables**, add the following:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL pooled connection string |
| `AUTH_SECRET` | ✅ | Random 32+ char string for JWT signing |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your production URL (e.g. `https://decor-ritual.vercel.app`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | From Cloudinary dashboard — server-side only |
| `AMAZON_ASSOCIATE_TAG` | ⬜ | Amazon Associates tracking tag (optional) |

> **Tip:** Generate a secure `AUTH_SECRET` at [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

### Step 4 — Redeploy

After adding all environment variables, trigger a **Redeploy** from the Vercel dashboard.

### Step 5 — Set Up the Database

Your Neon database schema needs to be applied once. Run this locally (with your production `DATABASE_URL`):

```bash
npm run db:push
```

Or run migrations:

```bash
npm run db:migrate
```

### Step 6 — Create Your Admin Account

Visit `https://your-site.vercel.app/admin/login` and sign in using the credentials you set up during DB seeding.

---

## 🛠️ Local Development

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/decor-ritual.git
cd decor-ritual

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your values

# 4. Push database schema
npm run db:push

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.
Admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database | [Neon PostgreSQL](https://neon.tech) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Auth | Custom JWT via [jose](https://github.com/panva/jose) |
| Images | [Cloudinary](https://cloudinary.com) |
| Styling | Tailwind CSS v4 |
| Deployment | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
decor-ritual/
├── app/
│   ├── (storefront)/     # Public storefront pages
│   └── admin/            # Protected admin dashboard
├── components/
│   ├── storefront/       # Public UI components
│   ├── admin/            # Admin UI components
│   └── ui/               # Shared UI primitives
├── lib/
│   ├── actions/          # Server actions
│   ├── auth/             # JWT session management
│   ├── data/             # Public data-access layer
│   ├── db/               # Drizzle client & schema
│   └── repositories/     # Admin data-access layer
└── proxy.ts              # Next.js middleware (auth guard)
```

---

## 🔐 Security Notes

- Admin routes (`/admin/*`) are protected by JWT middleware in `proxy.ts`
- `CLOUDINARY_API_SECRET` is **never** exposed client-side
- All HTTP security headers (CSP, HSTS, X-Frame-Options) are set in `next.config.ts`
- The admin UI link is hidden from the public storefront
