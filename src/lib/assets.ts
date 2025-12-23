// URL base del Blob storage (configurar en .env)
const BLOB_BASE =
	process.env.NEXT_PUBLIC_BLOB_URL ?? "https://mltbqy256fvxokxq.public.blob.vercel-storage.com";

const ASSETS = {
	logos: {
		store: {
			light: `${BLOB_BASE}/store-assets/logos/store-logo.svg`,
			dark: `${BLOB_BASE}/store-assets/logos/store-logo-dark.svg`,
		},
		shadcn: `${BLOB_BASE}/store-assets/logos/shadcn-ui-wordmark.svg`,
		vercel: `${BLOB_BASE}/store-assets/logos/vercel-wordmark.svg`,
		nextjs: `${BLOB_BASE}/store-assets/logos/nextjs-wordmark.svg`,
		stripe: `${BLOB_BASE}/store-assets/logos/stripe-logo.svg`,
		supabase: {
			light: `${BLOB_BASE}/store-assets/logos/supabase-wordmark.svg`,
			dark: `${BLOB_BASE}/store-assets/logos/supabase-wordmark-dark.svg`,
		},
		tailwind: {
			light: `${BLOB_BASE}/store-assets/logos/tailwind-wordmark-light.svg`,
			dark: `${BLOB_BASE}/store-assets/logos/tailwind-wordmark-dark.svg`,
		},
	},
	promotional: {
		cosmeticDisplay: `${BLOB_BASE}/store-assets/promotional/cosmetic-display.png`,
	},
	paymentMethods: {
		amazonpay: `${BLOB_BASE}/store-assets/payment-methods/amazonpay.svg`,
		applepay: `${BLOB_BASE}/store-assets/payment-methods/applepay.svg`,
		mastercard: `${BLOB_BASE}/store-assets/payment-methods/mastercard.svg`,
		paypal: `${BLOB_BASE}/store-assets/payment-methods/paypal.svg`,
		visa: `${BLOB_BASE}/store-assets/payment-methods/visa.svg`,
		discover: `${BLOB_BASE}/store-assets/payment-methods/discover.svg`,
	},
} as const;

export { ASSETS };
export type AssetsType = typeof ASSETS;
export type LogosType = typeof ASSETS.logos;
export type PaymentMethodsType = typeof ASSETS.paymentMethods;
