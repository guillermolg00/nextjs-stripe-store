# Next Stripe Store

A production-ready Next.js e-commerce boilerplate powered by Stripe. Build modern, high-performance online stores with automatic tax calculation, multi-currency support, and seamless checkout experiences.

## ✨ Features

- **🛒 Full E-commerce Flow** – Product browsing, variant selection, cart management, and Stripe Checkout
- **💳 Stripe Integration** – Products, Prices, automatic tax, shipping rates, and promotion codes
- **⚡ Next.js 16** – App Router, React Server Components, React Compiler, and streaming
- **🎨 Modern UI** – Tailwind CSS v4 + Shadcn UI (50+ accessible components)
- **🔐 Authentication** – Better Auth with email/password (easily extendable)
- **📱 Responsive** – Mobile-first design with optimized images
- **🚀 Performance** – Server-side caching, Suspense boundaries, and optimistic updates

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, RSC) |
| Runtime | Bun |
| Payments | Stripe (Products, Prices, Checkout) |
| Styling | Tailwind CSS v4 |
| Components | Shadcn UI + Radix Primitives |
| Auth | Better Auth |
| Linting | Biome |
| Language | TypeScript (strict) |

## 📋 Prerequisites

- **Bun** 1.0+ ([install](https://bun.sh))
- **Stripe Account** with API keys and at least one active Product/Price
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
# Required
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_ROOT_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-min-32-chars-long

# Optional
NEXT_PUBLIC_LOCALE=en-US
STRIPE_SHIPPING_RATE_ID=shr_xxxxx
```

### 3. Run Development Server

```bash
bun dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
app/
├── (store)/                 # Storefront routes
│   ├── page.tsx             # Home (hero + featured products)
│   ├── products/            # All products listing
│   ├── product/[slug]/      # Product detail page
│   ├── category/[slug]/     # Category/collection pages
│   ├── cart/                # Full cart page
│   └── checkout/            # Checkout redirect to Stripe
├── (auth)/                  # Authentication routes
│   ├── login/               # Login page
│   └── register/            # Registration page
├── api/auth/                # Better Auth API handler
└── cart/                    # Cart actions & state

components/
├── layout/                  # Header, Footer
├── product/                 # ProductCard, ProductGallery
├── cart/                    # CartItem
├── sections/                # Hero, ProductGrid
└── ui/                      # 50+ Shadcn components

features/
├── auth/                    # Auth client, hooks, service
├── cart/                    # Cart store, utilities
└── product/                 # Product service, types

lib/
├── commerce.ts              # Stripe commerce helpers
├── auth.ts                  # Better Auth config
├── money.ts                 # Currency formatting
└── utils.ts                 # Utility functions
```

## 🎯 Stripe Setup

### Products & Prices

1. Create Products in [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Add metadata for enhanced features:
   - `slug` – URL-friendly identifier (auto-generated from name if not set)
   - `collection` – Comma-separated collection names (e.g., "Electronics, Featured")
   - `summary` – Short product description

3. Create Prices with variant metadata:
   - `option_Size` – e.g., "Small", "Medium", "Large"
   - `option_Color` – e.g., "#FF0000" (hex values render as color swatches)

### Checkout Configuration

- **Automatic Tax**: Enabled by default via `automatic_tax: { enabled: true }`
- **Shipping**: Set `STRIPE_SHIPPING_RATE_ID` or a zero-cost rate is created per session
- **Promotions**: Promotion codes enabled via `allow_promotion_codes: true`

## 📜 Available Scripts

```bash
bun dev          # Start development server
bun run build    # Production build
bun start        # Start production server
bun run lint     # Run Biome linter
bun run format   # Format code with Biome
bun test         # Run tests
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `next.config.mjs` | Next.js config (React Compiler, image domains) |
| `biome.json` | Linting & formatting rules |
| `tsconfig.json` | TypeScript configuration |
| `components.json` | Shadcn UI configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |

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
