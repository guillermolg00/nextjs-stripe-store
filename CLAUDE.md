# CLAUDE.md

Technical reference for Claude Code (and other agents) when working with Next Stripe Store.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `bun dev` | Start development server |
| `bun run lint` | Check code with Biome |
| `bun run format` | Format code with Biome |
| `bunx tsc --noEmit` | Type check without emit |
| `bunx drizzle-kit migrate` | Apply database migrations |

## Project Overview

**Next Stripe Store** is a Next.js 16.1 + React 19 e-commerce app with:

- **Next.js 16.1** – App Router, RSC, React Compiler (`reactCompiler: true`), `cacheComponents: true`
- **React 19** – RSC + streaming
- **Catalog in Postgres** – Products/variants/collections stored in DB via Drizzle ORM
- **Stripe** – Checkout Sessions + Webhooks, plus a sync layer that pushes DB catalog to Stripe Products/Prices
- **Better Auth** – Email/password auth backed by Drizzle adapter, with DB-backed roles (`USER`/`ADMIN`)
- **Zustand** – Client cart state (optimistic UI) hydrated from server
- **Tailwind CSS v4** – Configured via PostCSS (no `tailwind.config.ts`)
- **Biome** – Lint/format (no ESLint/Prettier)
- **TypeScript** – Strict type checking

## Architecture

### Catalog + Commerce Layer (`src/lib/commerce.ts`)

This project’s **source of truth is the database**. `commerce.*` queries the DB and exposes a UI-friendly shape:

- `ProductVariant.id` is the **Stripe Price ID** (`stripePriceId`) for cart/checkout compatibility.

```typescript
// Product listing
const { data: products } = await commerce.productBrowse({ limit: 12 });

// Single product by slug or ID
const product = await commerce.productGet({ idOrSlug: "my-product" });

// Collections (DB-backed)
const { data: collections } = await commerce.collectionBrowse({ limit: 5 });

// Variant with product (used by cart hydration)
const result = await commerce.getVariantWithProduct(priceId);
```

### Product Sync to Stripe (`src/lib/product-sync.ts`)

Admin workflows push DB products/variants to Stripe so Checkout can price items by Stripe Price ID.

- Product → Stripe Product (`products.stripeProductId`)
- Variant → Stripe Price (`product_variants.stripePriceId`)
- Variant options are written to Stripe Price `metadata` with keys starting with `option...`

### Cart System (`src/app/cart/actions.ts`)

- Cart stored in httpOnly `cart` cookie (Stripe Price IDs + quantities)
- Single currency per cart enforced
- Server actions: `getCart`, `addToCart`, `removeFromCart`, `setCartQuantity`, `startCheckout`

```typescript
// Add item to cart
const result = await addToCart(variantId, quantity);

// Start Stripe Checkout
const { url } = await startCheckout();
```

### Orders + Webhooks

- `POST /api/webhooks/stripe` verifies signature with `STRIPE_WEBHOOK_SECRET`
- Creates and updates orders via `src/lib/orders.ts`
- Handles:
  - `checkout.session.completed` → create order + items
  - `payment_intent.succeeded` → mark paid
  - `charge.refunded` → mark refunded / partially_refunded

### Data Model (High Level)

```
DB Product        → products (id, slug, stripeProductId?, syncStatus, ...)
DB Variant        → product_variants (id, stripePriceId?, price, currency, options, syncStatus, ...)
Cart line item    → Stripe Price ID + quantity (stored in httpOnly cookie)
Order persistence → orders + order_items (created from Stripe sessions via webhook)
```

## File Structure

```
src/
├── app/
│   ├── (store)/                     # Store routes
│   ├── (auth)/                      # Login/register
│   ├── admin/                       # Admin pages
│   ├── api/
│   │   ├── auth/[...betterAuth]/    # Better Auth handler
│   │   ├── admin/*                  # Admin endpoints (CRUD + sync)
│   │   └── webhooks/stripe/         # Stripe webhook handler
│   └── cart/                        # Server cart actions + cart sidebar UI
├── components/                      # UI + domain components
├── db/                              # Drizzle schema + db client
├── lib/                             # commerce, orders, auth, product sync, money, utils
└── utils/                           # shared pure helpers (e.g. cart totals)
```

## Code Patterns

### Server Components with Caching

```tsx
async function ProductList() {
  "use cache";
  cacheLife("seconds");
  
  const { data: products } = await commerce.productBrowse({ limit: 12 });
  return <ProductGrid products={products} />;
}

// Always wrap in Suspense
<Suspense fallback={<Skeleton />}>
  <ProductList />
</Suspense>
```

### Client Components with Cart

```tsx
"use client";

import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/components/cart/use-cart";

function AddButton({ variantId }: { variantId: string }) {
  const openCart = useCart((state) => state.openCart);
  const add = useCart((state) => state.add);
  const sync = useCart((state) => state.sync);
  
  const handleAdd = async () => {
    openCart();
    add({
      quantity: 1,
      productVariant: {
        id: variantId,
        // price/currency/images/combinations/product omitted for brevity
      },
    });
    const result = await addToCart(variantId, 1);
    if (result?.cart) sync(result.cart);
  };
  
  return <button onClick={handleAdd}>Add to Cart</button>;
}
```

### Price Formatting

```typescript
import { formatMoney } from "@/lib/money";

// Always use BigInt for prices (stored as string in minor units)
const price = formatMoney({
  amount: BigInt(variant.price),
  currency: variant.currency,
  locale: process.env.NEXT_PUBLIC_LOCALE ?? "en-US",
});
```

### URL-Driven State (Variants)

```tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

function VariantSelector({ variants }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const selectOption = (label: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(label, value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  
  // Derive selected variant from URL
  const selected = useMemo(() => {
    return variants.find(v => /* match combinations with searchParams */);
  }, [variants, searchParams]);
}
```

## Biome Notes

- Formatting uses **tabs** and **double quotes** by default (see `biome.json`).
- Imports are organized automatically via Biome assist.
- Prefer pure helpers + small modules; avoid “god files” when adding new features.

## Common Mistakes to Avoid

### ❌ Using Node.js tools
```bash
# Wrong
npm install
node script.js

# Correct
bun install
bun script.js
```

### ❌ Accessing cookies/data outside Suspense
```tsx
// Wrong - blocks entire page
export default async function Layout({ children }) {
  const cart = await getCart(); // Uncached data!
  return <CartProvider cart={cart}>{children}</CartProvider>;
}

// Correct - wrap in Suspense
export default function Layout({ children }) {
  return (
    <Suspense fallback={<Shell />}>
      <CartLoader>{children}</CartLoader>
    </Suspense>
  );
}
```

### ❌ Using `new Date()` in Server Components
```tsx
// Wrong - causes prerender warning
function Footer() {
  return <p>© {new Date().getFullYear()}</p>;
}

// Correct - use client component with Suspense
"use client";
function CopyrightYear() {
  return <>{new Date().getFullYear()}</>;
}

// In Footer:
<Suspense fallback="2025"><CopyrightYear /></Suspense>
```

### ❌ String literals for Stripe types
```typescript
// Wrong - type widening
const countries = ["US", "CA"]; // string[]

// Correct - const assertion
const countries = ["US", "CA"] as const;
```

## Environment Variables

```bash
# Required (core)
DATABASE_URL=postgres://...
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_ROOT_URL=http://localhost:3000

# Recommended (auth)
BETTER_AUTH_SECRET=min-32-chars

# Optional
NEXT_PUBLIC_LOCALE=en-US
NEXT_PUBLIC_BLOB_URL=https://...
STRIPE_SHIPPING_RATE_ID=shr_xxx

# Optional but recommended (orders)
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Testing Checklist

- [ ] `bunx tsc --noEmit` – Type check passes
- [ ] `bun run lint` – No Biome errors
- [ ] Add to cart works (opens sidebar, item appears)
- [ ] Variant selection updates URL and price
- [ ] Checkout redirects to Stripe
- [ ] Mobile responsive (test at 375px width)
- [ ] No console errors in browser

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/commerce.ts` | DB-backed product/collection queries + Stripe client |
| `src/lib/product-sync.ts` | Push DB catalog to Stripe (Products/Prices) |
| `src/app/cart/actions.ts` | Cart cookies + checkout session creation |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook → order persistence |
| `src/lib/orders.ts` | Order creation + status/refund updates |
| `src/components/cart/use-cart.ts` | Zustand cart store (client) |
| `src/app/(store)/layout.tsx` | Store shell with Suspense cart hydration |
| `src/components/ui/*` | Shadcn component library |
