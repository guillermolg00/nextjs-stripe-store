# AGENTS.md

Specialized guidance for AI agents working with Next Stripe Store.

## Agent Profiles

### 🔍 Explorer Agent
**Goal**: Understand codebase structure, trace data flow, locate relevant code.

**Entry Points**:
| Task | Start Here |
|------|------------|
| Stripe data | `lib/commerce.ts` |
| Cart operations | `app/cart/actions.ts` |
| Product pages | `app/(store)/product/[slug]/` |
| UI components | `components/ui/` |
| Store layout | `app/(store)/layout.tsx` |

**Key Patterns to Recognize**:
- `"use server"` → Server action file
- `"use cache"` → Cached async component
- `"use client"` → Client component with interactivity
- `commerce.*` → Stripe data access
- `dispatch({ type: ... })` → Cart state mutation

### 📋 Planner Agent
**Goal**: Design implementation strategy before coding.

**Planning Checklist**:
1. ✅ Identify affected routes/components
2. ✅ Determine server vs client components
3. ✅ Plan Suspense boundaries for async data
4. ✅ Consider cart currency constraints
5. ✅ Define type interfaces
6. ✅ List test scenarios

**Decision Tree**:
```
Need to fetch data?
├── Yes → Server Component
│   ├── Cacheable? → Add "use cache" + cacheLife()
│   └── Dynamic? → Wrap parent in <Suspense>
└── No → Consider if Server Component still works

Need interactivity?
├── Clicks/state → "use client"
├── URL params → useSearchParams + useMemo
└── Cart mutations → useCart + server action
```

### 🛠 Implementer Agent
**Goal**: Execute implementation with quality.

**Setup Commands**:
```bash
bun dev              # Start server
bun run lint         # Check code
bunx tsc --noEmit    # Type check
```

**Implementation Rules**:
| Constraint | Requirement |
|------------|-------------|
| Exports | Named exports only (except Next.js special files) |
| Loops | Use `map`/`filter`/`reduce`, never `for...of` |
| Types | No `any`, rely on inference |
| Imports | Use `@/` path aliases |
| Prices | Always `BigInt()`, never number literals |

## Task Recipes

### Add a New Product Feature

```tsx
// 1. Fetch data with commerce helpers
const product = await commerce.productGet({ idOrSlug: slug });

// 2. Create cached component
async function ProductInfo({ slug }: { slug: string }) {
  "use cache";
  cacheLife("seconds");
  
  const product = await commerce.productGet({ idOrSlug: slug });
  if (!product) return notFound();
  
  return <div>{product.name}</div>;
}

// 3. Wrap in Suspense at usage site
<Suspense fallback={<Skeleton />}>
  <ProductInfo slug={params.slug} />
</Suspense>
```

### Add a New Page Route

```tsx
// app/(store)/my-page/page.tsx
import { Suspense } from "react";

export default function MyPage() {
  return (
    <main>
      <Suspense fallback={<Loading />}>
        <AsyncContent />
      </Suspense>
    </main>
  );
}
```

### Add Cart Functionality

```tsx
"use client";

import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/features/cart/cart.store";

function AddButton({ variantId, variant, product }) {
  const { dispatch, openCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    openCart();
    startTransition(async () => {
      // Optimistic update
      dispatch({
        type: "ADD_ITEM",
        item: {
          quantity: 1,
          productVariant: { ...variant, product },
        },
      });
      
      // Server sync
      const result = await addToCart(variantId, 1);
      if (result?.cart) {
        dispatch({ type: "SYNC", cart: result.cart });
      }
    });
  };

  return (
    <button onClick={handleAdd} disabled={isPending}>
      {isPending ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

### Format Prices Correctly

```typescript
import { formatMoney } from "@/lib/money";

// Variant prices are strings in minor units
const variant = { price: "1999", currency: "USD" };

// Convert to BigInt for calculations
const total = BigInt(variant.price) * BigInt(quantity);

// Format for display
const display = formatMoney({
  amount: total,
  currency: variant.currency,
  locale: process.env.NEXT_PUBLIC_LOCALE ?? "en-US",
});
```

## Anti-Patterns to Avoid

### ❌ Blocking Data in Layouts
```tsx
// WRONG: Blocks all child pages
export default async function Layout({ children }) {
  const data = await fetchData(); // No Suspense!
  return <Provider data={data}>{children}</Provider>;
}

// CORRECT: Suspense boundary
export default function Layout({ children }) {
  return (
    <Suspense fallback={<Shell />}>
      <AsyncProvider>{children}</AsyncProvider>
    </Suspense>
  );
}
```

### ❌ useEffect for Derived State
```tsx
// WRONG: Sync with effect
const [selected, setSelected] = useState(null);
useEffect(() => {
  setSelected(variants.find(...));
}, [variants, searchParams]);

// CORRECT: Derive with useMemo
const selected = useMemo(() => {
  return variants.find(...);
}, [variants, searchParams]);
```

### ❌ Hardcoded Stripe Types
```typescript
// WRONG: Type widens to string
const type = "fixed_amount";
const countries = ["US", "CA"];

// CORRECT: Const assertion
const type = "fixed_amount" as const;
const countries = ["US", "CA"] as const;
```

## Validation Checklist

Before marking task complete:

- [ ] **Types**: `bunx tsc --noEmit` passes
- [ ] **Lint**: `bun run lint` passes  
- [ ] **Suspense**: All `"use cache"` components wrapped
- [ ] **Cart**: Add/remove works, sidebar opens
- [ ] **Mobile**: Test at 375px viewport
- [ ] **Console**: No errors in browser dev tools

## File Quick Reference

| Need | File |
|------|------|
| Stripe API calls | `lib/commerce.ts` |
| Cart mutations | `app/cart/actions.ts` |
| Cart UI state | `features/cart/cart.store.tsx` |
| Price formatting | `lib/money.ts` |
| Site constants | `lib/constants.ts` |
| Shadcn components | `components/ui/*` |
| Product card | `components/product/product-card.tsx` |
| Store layout | `app/(store)/layout.tsx` |

## Environment Variables

```bash
STRIPE_SECRET_KEY      # Required - Stripe secret key
STRIPE_PUBLISHABLE_KEY # Required - Stripe public key  
NEXT_PUBLIC_ROOT_URL   # Required - Base URL for redirects
BETTER_AUTH_SECRET     # Required - Auth secret (≥32 chars)
NEXT_PUBLIC_LOCALE     # Optional - Formatting locale
STRIPE_SHIPPING_RATE_ID # Optional - Reusable shipping rate
```
