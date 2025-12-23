# CLAUDE.md

Technical reference for Claude Code when working with Next Stripe Store.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `bun dev` | Start development server |
| `bun run lint` | Check code with Biome |
| `bun run format` | Format code with Biome |
| `bunx tsc --noEmit` | Type check without emit |

## Project Overview

**Next Stripe Store** is a Next.js 16 e-commerce application with:

- **Next.js 16** – App Router, RSC, React Compiler, `"use cache"` directive
- **Stripe** – Products, Prices, Checkout Sessions, automatic tax
- **Bun** – Runtime and package manager (NOT npm/node)
- **Tailwind CSS v4** – Utility-first styling
- **Biome** – Linting and formatting (NOT ESLint/Prettier)
- **TypeScript** – Strict type checking

## Architecture

### Commerce Layer (`lib/commerce.ts`)

```typescript
// Product listing
const { data: products } = await commerce.productBrowse({ limit: 12 });

// Single product by slug or ID
const product = await commerce.productGet({ idOrSlug: "my-product" });

// Collections (derived from product.metadata.collection)
const { data: collections } = await commerce.collectionBrowse({ limit: 5 });

// Variant with product (for cart hydration)
const result = await commerce.getVariantWithProduct(priceId);
```

### Cart System (`app/cart/actions.ts`)

- Cart stored in httpOnly `cart` cookie (Stripe Price IDs + quantities)
- Single currency per cart enforced
- Server actions: `addToCart`, `removeFromCart`, `setCartQuantity`, `startCheckout`

```typescript
// Add item to cart
const result = await addToCart(variantId, quantity);

// Start Stripe Checkout
const { url } = await startCheckout();
```

### Data Model

```
Stripe Product → Product (id, slug, name, images, variants, collections)
Stripe Price   → ProductVariant (id, price, currency, images, combinations)
Price metadata → Variant options (option_Size, option_Color, etc.)
```

## File Structure

```
app/
├── (store)/                    # Store routes (uses StoreLayout)
│   ├── layout.tsx              # Header, Footer, CartProvider
│   ├── page.tsx                # Home page
│   ├── products/page.tsx       # All products
│   ├── product/[slug]/page.tsx # Product detail
│   ├── category/[slug]/page.tsx
│   ├── cart/page.tsx
│   └── checkout/page.tsx
├── (auth)/                     # Auth routes
│   ├── login/page.tsx
│   └── register/page.tsx
├── cart/                       # Cart logic (NOT a route)
│   ├── actions.ts              # Server actions
│   ├── types.ts                # Cart types
│   └── cart-sidebar.tsx        # Slide-out cart
├── api/auth/[...betterAuth]/   # Better Auth handler
└── layout.tsx                  # Root layout

components/
├── layout/                     # Header, Footer, CopyrightYear
├── product/                    # ProductCard, ProductGallery
├── cart/                       # CartItem
├── sections/                   # Hero, ProductGrid
└── ui/                         # 50+ Shadcn components

features/
├── auth/                       # auth.client, auth.hooks, auth.service
├── cart/                       # cart.store (Zustand-like), cart.utils
└── product/                    # product.service, product.types

lib/
├── commerce.ts                 # Stripe commerce helpers
├── auth.ts                     # Better Auth server config
├── money.ts                    # formatMoney({ amount, currency, locale })
├── constants.ts                # SITE_NAME, DEFAULT_CURRENCY
├── invariant.ts                # Runtime assertions
└── utils.ts                    # cn() for classnames
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

import { useCart } from "@/features/cart/cart.store";

function AddButton({ variantId }: { variantId: string }) {
  const { dispatch, openCart } = useCart();
  
  const handleAdd = async () => {
    openCart();
    dispatch({ type: "ADD_ITEM", item: {...} });
    const result = await addToCart(variantId, 1);
    if (result?.cart) {
      dispatch({ type: "SYNC", cart: result.cart });
    }
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
  locale: "en-US"
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

## Biome Rules (Key Constraints)

| Rule | Requirement |
|------|-------------|
| `noDefaultExport` | Only in Next.js special files (page.tsx, layout.tsx, etc.) |
| `noExplicitAny` | Never use `any` type |
| `noForOf` | Use `map`, `filter`, `reduce` instead |
| `noMutatingForEach` | Use `reduce` for accumulating |
| Line width | 110 characters max |

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
# Required
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_ROOT_URL=http://localhost:3000
BETTER_AUTH_SECRET=min-32-chars

# Optional
NEXT_PUBLIC_LOCALE=en-US
STRIPE_SHIPPING_RATE_ID=shr_xxx
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
| `lib/commerce.ts` | All Stripe product/price operations |
| `app/cart/actions.ts` | Cart mutations and checkout |
| `features/cart/cart.store.tsx` | Client-side cart state |
| `app/(store)/layout.tsx` | Store shell with Suspense boundaries |
| `components/ui/*` | Shadcn component library |
