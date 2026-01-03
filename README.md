# Next Stripe Store

A production-ready Next.js e-commerce boilerplate powered by Stripe **and a Postgres-backed catalog**. Build modern, high-performance stores with a database-first product model, Stripe Checkout, and order persistence via webhooks.

## ✨ Features

- **🛒 Full e-commerce flow** – Product browsing, variant selection, cart management, Stripe Checkout
- **🗃️ Database-backed catalog** – Products/variants/collections stored in Postgres via Drizzle ORM
- **🔁 Stripe sync layer** – Push products + prices to Stripe for Checkout compatibility
- **📦 Orders + webhook processing** – Persist orders on `checkout.session.completed`, update status/refunds
- **🧑‍💼 Admin workflows** – Admin-only CRUD + sync endpoints/actions for products, variants, collections
- **⚡ Next.js 16.1 + React 19** – App Router, RSC, React Compiler, streaming, `cacheComponents`
- **🎨 Modern UI** – Tailwind CSS v4 + Shadcn UI (50+ accessible components)
- **🔐 Authentication** – Better Auth + Drizzle adapter (email/password), role-based admin gate
- **📱 Responsive** – Mobile-first design with optimized images
- **🚀 Performance** – Server-side caching, Suspense boundaries, and optimistic updates

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1 (App Router, RSC, React Compiler) |
| Runtime | Bun |
| DB | Postgres + Drizzle ORM |
| Payments | Stripe (Checkout, Products/Prices sync, Webhooks) |
| Styling | Tailwind CSS v4 |
| Components | Shadcn UI + Radix Primitives |
| Auth | Better Auth |
| State | Zustand (cart UI + optimistic state) |
| Linting | Biome |
| Language | TypeScript (strict) |

## 📋 Prerequisites

- **Bun** 1.0+ ([install](https://bun.sh))
- **Postgres** reachable via `DATABASE_URL`
- **Stripe Account** with a secret key (and webhook secret if you want orders)
- **Node.js** 20+ (for Next.js compatibility)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url> next-stripe-store
cd next-stripe-store
bun install
```

### 2. Configure Environment

Create `.env` file with your credentials:

```bash
# Required (core)
DATABASE_URL=postgres://user:pass@localhost:5432/next_stripe_store
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_ROOT_URL=http://localhost:3000

# Recommended (auth)
BETTER_AUTH_SECRET=your-secret-min-32-chars-long

# Optional
NEXT_PUBLIC_LOCALE=en-US
NEXT_PUBLIC_BLOB_URL=https://<your-public-blob-host>
STRIPE_SHIPPING_RATE_ID=shr_xxxxx

# Optional but recommended (orders)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Apply Database Migrations

This repo includes Drizzle migrations in `drizzle/` and uses `drizzle.config.ts`.

```bash
bunx drizzle-kit migrate
```

### 4. Run Development Server

```bash
bun dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (store)/                       # Storefront routes
│   │   ├── layout.tsx                 # Header/Footer + Cart Suspense boundary
│   │   ├── page.tsx                   # Home
│   │   ├── products/page.tsx          # All products
│   │   ├── product/[slug]/            # Product detail + variant selection
│   │   ├── category/[slug]/page.tsx   # Collections
│   │   ├── cart/                      # Full cart page
│   │   ├── checkout/                  # Checkout flow (success/cancel)
│   │   └── orders/                    # Order history + details
│   ├── (auth)/                        # Auth routes
│   ├── admin/                         # Admin pages (product management)
│   ├── api/
│   │   ├── auth/[...betterAuth]/      # Better Auth handler
│   │   ├── admin/*                    # Admin CRUD + sync endpoints
│   │   └── webhooks/stripe/           # Stripe webhook handler
│   └── cart/                          # Cart server actions + sidebar UI
├── components/                        # UI + domain components
├── db/                                # Drizzle db + schema
└── lib/                               # Commerce, auth, money, orders, product sync
```

## 🎯 Stripe Setup

### Catalog vs Stripe

This project treats **Postgres as the source of truth** for products and variants.

- **Admin creates/edits products in DB**, then sync pushes to Stripe:
  - Product → Stripe Product
  - Variant → Stripe Price (stored back as `stripePriceId` for cart/checkout)
- Variant option metadata is stored on Stripe Prices (keys starting with `option...`).
  - Values starting with `#` are treated as colors in the UI.

### Checkout Configuration

- **Automatic Tax**: Enabled by default via `automatic_tax: { enabled: true }`
- **Shipping**: Set `STRIPE_SHIPPING_RATE_ID` or a zero-cost rate is created per session
- **Promotions**: Promotion codes enabled via `allow_promotion_codes: true`

### Webhooks (Orders)

To persist orders automatically, configure a Stripe webhook endpoint pointing to:

- `POST /api/webhooks/stripe`

Enable at least:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `charge.refunded`

## 📜 Available Scripts

```bash
bun dev          # Start development server
bun run build    # Production build
bun start        # Start production server
bun run lint     # Run Biome linter
bun run format   # Format code with Biome
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `next.config.mjs` | Next.js config (React Compiler, cache components, image domains) |
| `biome.json` | Linting & formatting rules |
| `tsconfig.json` | TypeScript configuration |
| `components.json` | Shadcn UI configuration |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `drizzle.config.ts` | Drizzle Kit configuration (schema + migrations) |

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** – Technical reference for AI assistants
- **[AGENTS.md](./AGENTS.md)** – Workflow guidance for AI agents

## 🔗 Resources

- [Stripe Checkout Documentation](https://docs.stripe.com/payments/checkout)
- [Stripe Products & Prices](https://docs.stripe.com/products-prices)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Shadcn UI Components](https://ui.shadcn.com)
- [Better Auth Documentation](https://better-auth.com)

## 📄 License

MIT License - feel free to use this boilerplate for your projects.
