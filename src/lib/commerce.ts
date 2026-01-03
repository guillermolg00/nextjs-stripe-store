"server-only";
import { and, desc, eq, isNotNull, or } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/db/db";
import {
	collections as collectionsTable,
	products as productsTable,
	productVariants,
	type VariantOption,
} from "@/db/schema";
import { invariant } from "./invariant";
import { slugify } from "./utils";

type VariantValue = {
	id: string;
	value: string;
	colorValue: string | null;
	variantType: {
		id: string;
		type: "string" | "color";
		label: string;
	};
};

export type ProductVariant = {
	id: string; // This is stripePriceId for cart/checkout compatibility
	price: string;
	currency: string;
	images: string[];
	combinations: { variantValue: VariantValue }[];
};

export type Product = {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	summary: string | null;
	images: string[];
	variants: ProductVariant[];
	collections: CollectionTag[];
};

type CollectionTag = {
	slug: string;
	name: string;
	image?: string | null;
	description?: string | null;
};

export type Collection = {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	image: string | null;
	products: Product[];
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
invariant(stripeSecretKey, "Missing env.STRIPE_SECRET_KEY");

export const stripe = new Stripe(stripeSecretKey);

type DbProduct = typeof productsTable.$inferSelect & {
	variants: (typeof productVariants.$inferSelect)[];
	productCollections: {
		collection: typeof collectionsTable.$inferSelect;
	}[];
};

type DbVariant = typeof productVariants.$inferSelect;

const mapOptionsToVariantValues = (
	options: VariantOption[],
	stripePriceId: string,
): { variantValue: VariantValue }[] => {
	return options.map((opt) => ({
		variantValue: {
			id: `${stripePriceId}-${opt.key}`,
			value: opt.value,
			colorValue: opt.type === "color" ? (opt.colorValue ?? opt.value) : null,
			variantType: {
				id: opt.key,
				type: opt.type,
				label: opt.label,
			},
		},
	}));
};

const mapDbVariantToProductVariant = (
	variant: DbVariant,
): ProductVariant | null => {
	// Only expose variants that are synced and have a stripePriceId
	if (
		!variant.stripePriceId ||
		variant.syncStatus !== "synced" ||
		!variant.active
	) {
		return null;
	}

	return {
		id: variant.stripePriceId,
		price: variant.price,
		currency: variant.currency,
		images: variant.images ?? [],
		combinations: mapOptionsToVariantValues(
			variant.options ?? [],
			variant.stripePriceId,
		),
	};
};

const mapDbProductToProduct = (dbProduct: DbProduct): Product => {
	const validVariants = dbProduct.variants
		.map(mapDbVariantToProductVariant)
		.filter((v): v is ProductVariant => v !== null);

	return {
		id: dbProduct.id,
		slug: dbProduct.slug,
		name: dbProduct.name,
		description: dbProduct.description,
		summary: dbProduct.summary,
		images: dbProduct.images ?? [],
		variants: validVariants,
		collections: dbProduct.productCollections.map((pc) => ({
			slug: pc.collection.slug,
			name: pc.collection.name,
			image: pc.collection.image,
			description: pc.collection.description,
		})),
	};
};

const productBrowse = async ({ limit = 12 }: { limit?: number }) => {
	const data = await db.query.products.findMany({
		where: eq(productsTable.active, true),
		limit,
		with: {
			variants: true,
			productCollections: {
				with: { collection: true },
			},
		},
		orderBy: [desc(productsTable.createdAt)],
	});

	const products = data
		.map(mapDbProductToProduct)
		.filter((p) => p.variants.length > 0);

	return { data: products };
};

const productGet = async ({ idOrSlug }: { idOrSlug: string }) => {
	const normalizedSlug = slugify(idOrSlug);

	const product = await db.query.products.findFirst({
		where: and(
			eq(productsTable.active, true),
			or(
				eq(productsTable.id, idOrSlug),
				eq(productsTable.slug, normalizedSlug),
				eq(productsTable.stripeProductId, idOrSlug),
			),
		),
		with: {
			variants: true,
			productCollections: {
				with: { collection: true },
			},
		},
	});

	if (!product) {
		return null;
	}

	const mapped = mapDbProductToProduct(product);

	if (mapped.variants.length === 0) {
		return null;
	}

	return mapped;
};

const collectionBrowse = async ({ limit = 5 }: { limit?: number }) => {
	const collectionsData = await db.query.collections.findMany({
		limit: limit ?? undefined,
		with: {
			productCollections: {
				with: {
					product: {
						with: {
							variants: true,
							productCollections: {
								with: { collection: true },
							},
						},
					},
				},
			},
		},
		orderBy: [desc(collectionsTable.createdAt)],
	});

	const collections: Collection[] = collectionsData.map((coll) => ({
		id: coll.id,
		slug: coll.slug,
		name: coll.name,
		description: coll.description,
		image: coll.image,
		products: coll.productCollections
			.filter((pc) => pc.product.active)
			.map((pc) => mapDbProductToProduct(pc.product as DbProduct))
			.filter((p) => p.variants.length > 0),
	}));

	return { data: collections.filter((c) => c.products.length > 0) };
};

const collectionGet = async ({ idOrSlug }: { idOrSlug: string }) => {
	const normalizedSlug = slugify(idOrSlug);

	const collection = await db.query.collections.findFirst({
		where: or(
			eq(collectionsTable.id, idOrSlug),
			eq(collectionsTable.slug, normalizedSlug),
		),
		with: {
			productCollections: {
				with: {
					product: {
						with: {
							variants: true,
							productCollections: {
								with: { collection: true },
							},
						},
					},
				},
			},
		},
	});

	if (!collection) {
		return null;
	}

	return {
		id: collection.id,
		slug: collection.slug,
		name: collection.name,
		description: collection.description,
		image: collection.image,
		products: collection.productCollections
			.filter((pc) => pc.product.active)
			.map((pc) => mapDbProductToProduct(pc.product as DbProduct))
			.filter((p) => p.variants.length > 0),
	} satisfies Collection;
};

const getVariantWithProduct = async (variantId: string) => {
	const variant = await db.query.productVariants.findFirst({
		where: and(
			eq(productVariants.stripePriceId, variantId),
			eq(productVariants.syncStatus, "synced"),
			isNotNull(productVariants.stripePriceId),
		),
		with: {
			product: {
				with: {
					variants: true,
					productCollections: {
						with: { collection: true },
					},
				},
			},
		},
	});

	if (!variant || !variant.product.active) {
		return null;
	}

	const product = mapDbProductToProduct(variant.product as DbProduct);
	const mappedVariant = product.variants.find((v) => v.id === variantId);

	if (!mappedVariant) {
		return null;
	}

	return { product, variant: mappedVariant };
};

export const commerce = {
	productBrowse,
	productGet,
	collectionBrowse,
	collectionGet,
	getVariantWithProduct,
};
