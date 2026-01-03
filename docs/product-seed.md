# Product Seed

## Ejecutar el seed

```bash
bun run db:seed
```

## Estructura

Los datos del seed están en `scripts/seed-data.ts`:

```typescript
// Colecciones
export const collections: SeedCollection[] = [
  {
    name: "Organizers",
    slug: "organizers",
    description: "Tech organizers and pouches",
  },
];

// Productos
export const products: SeedProduct[] = [
  {
    name: "STOW ORGANIZER",
    summary: "Short description for cards",
    description: "Full description with features...",
    images: ["https://..."],
    collectionSlugs: ["organizers"],
    variants: [
      {
        price: "4999",        // $49.99 en centavos
        currency: "USD",
        images: ["https://..."],
        options: [
          {
            key: "color",
            label: "Color",
            value: "Sage",
            type: "color",
            colorValue: "#9CAF88",
          },
        ],
      },
    ],
  },
];
```

## Agregar productos

1. Edita `scripts/seed-data.ts`
2. Agrega el producto al array `products`
3. Ejecuta `bun run db:seed`

## Notas

- El seed es **idempotente**: no duplica productos existentes
- Los productos se sincronizan automáticamente a Stripe
- Usa `collectionSlugs` para vincular a colecciones existentes
