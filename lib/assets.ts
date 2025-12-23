/**
 * URLs de assets almacenados en Vercel Blob
 *
 * Para actualizar:
 * 1. Sube archivos a scripts/blob-assets/
 * 2. Ejecuta: bun scripts/upload-to-blob.ts
 * 3. Copia las URLs generadas aquí
 */

// TODO: Reemplaza esta URL base con la de tu Vercel Blob store
const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL ?? "";

export const ASSETS = {
	logos: {
		store: {
			light: `${BLOB_BASE}/store-assets/logos/store-logo.svg`,
			dark: `${BLOB_BASE}/store-assets/logos/store-logo-dark.svg`,
		},
		shadcn: `${BLOB_BASE}/store-assets/logos/shadcn-ui-wordmark.svg`,
		vercel: `${BLOB_BASE}/store-assets/logos/vercel-wordmark.svg`,
		supabase: {
			light: `${BLOB_BASE}/store-assets/logos/supabase-wordmark.svg`,
			dark: `${BLOB_BASE}/store-assets/logos/supabase-wordmark-dark.svg`,
		},
		tailwind: {
			light: `${BLOB_BASE}/store-assets/logos/tailwind-wordmark-light.svg`,
			dark: `${BLOB_BASE}/store-assets/logos/tailwind-wordmark-dark.svg`,
		},
	},
	paymentMethods: [
		`${BLOB_BASE}/store-assets/payment-methods/amazonpay.svg`,
		`${BLOB_BASE}/store-assets/payment-methods/applepay.svg`,
		`${BLOB_BASE}/store-assets/payment-methods/mastercard.svg`,
		`${BLOB_BASE}/store-assets/payment-methods/paypal.svg`,
		`${BLOB_BASE}/store-assets/payment-methods/visa.svg`,
		`${BLOB_BASE}/store-assets/payment-methods/discover.svg`,
	],
} as const;

// Alternativa: URLs directas después de subir (sin variable de entorno)
// Descomenta y usa estas después de ejecutar el script de upload:
//
// export const BLOB_URLS = {
//   logos_store_logo: "https://xxxxx.public.blob.vercel-storage.com/...",
//   logos_store_logo_dark: "https://xxxxx.public.blob.vercel-storage.com/...",
//   // ... etc
// } as const;

