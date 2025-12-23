import Stripe from "stripe";
import { invariant } from "./invariant";

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
	id: string;
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

const slugify = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");

const humanizeLabel = (value: string) =>
	value
		.replace(/^option[_-]?/i, "")
		.replace(/[_-]+/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase())
		.trim();

const parseCollections = (metadata: Stripe.Metadata) => {
	const raw = metadata.collection ?? metadata.collections ?? "";
	return raw
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((name) => ({
			name,
			slug: slugify(name),
			image: metadata.collection_image ?? metadata.image ?? null,
			description: metadata.collection_description ?? null,
		}));
};

const getVariantCombinations = (metadata: Stripe.Metadata, priceId: string): VariantValue[] => {
	const optionEntries = Object.entries(metadata ?? {}).filter(
		([key, value]) => key.startsWith("option") && value,
	);

	return optionEntries.map(([key, value]) => {
		const isColor = typeof value === "string" && value.startsWith("#");

		return {
			id: `${priceId}-${key}`,
			value: String(value),
			colorValue: isColor ? String(value) : null,
			variantType: {
				id: key,
				type: isColor ? "color" : "string",
				label: humanizeLabel(key),
			},
		};
	});
};

const mapPriceToVariant = (price: Stripe.Price, images: string[]): ProductVariant => ({
	id: price.id,
	price: String(price.unit_amount ?? 0),
	currency: price.currency.toUpperCase(),
	images: price.metadata.image ? [price.metadata.image] : images,
	combinations: getVariantCombinations(price.metadata, price.id).map((variantValue) => ({ variantValue })),
});

const mapProduct = (product: Stripe.Product, prices: Stripe.Price[]): Product => {
	const productImages = product.images ?? [];
	const variants = prices.map((price) => mapPriceToVariant(price, productImages));

	return {
		id: product.id,
		slug: product.metadata.slug ? slugify(product.metadata.slug) : slugify(product.name ?? product.id),
		name: product.name,
		description: product.description ?? null,
		summary: product.metadata.summary ?? product.description ?? null,
		images: productImages,
		variants,
		collections: parseCollections(product.metadata),
	};
};

const fetchProductPrices = async (productId: string) => {
	const prices = await stripe.prices.list({
		product: productId,
		active: true,
		limit: 100,
	});
	return prices.data.filter((price) => !price.deleted);
};

const searchProductBySlug = async (slug: string) => {
	// First try to find by metadata slug
	const metadataQuery = `active:'true' AND metadata['slug']:'${slug}'`;
	const metadataResult = await stripe.products.search({
		query: metadataQuery,
		limit: 1,
	});

	if (metadataResult.data[0]) {
		return metadataResult.data[0];
	}

	// If not found by metadata, search all products and match by slugified name
	const products = await stripe.products.list({
		active: true,
		limit: 100,
	});

	return (
		products.data.find((product) => {
			const productSlug = product.metadata.slug
				? slugify(product.metadata.slug)
				: slugify(product.name ?? product.id);
			return productSlug === slug;
		}) ?? null
	);
};

const buildProduct = async (product: Stripe.Product) => {
	const prices = await fetchProductPrices(product.id);
	return mapProduct(product, prices);
};

const getProductInternal = async (idOrSlug: string) => {
	try {
		const product = await stripe.products.retrieve(idOrSlug, {
			expand: ["default_price"],
		});

		if (product && !("deleted" in product)) {
			return product;
		}
	} catch {
		// fall back to search by slug
	}

	return searchProductBySlug(slugify(idOrSlug));
};

const productBrowse = async ({ limit = 12 }: { limit?: number }) => {
	const products = await stripe.products.list({
		active: true,
		limit,
		expand: ["data.default_price"],
	});

	const hydrated = await Promise.all(
		products.data.filter((product): product is Stripe.Product => !("deleted" in product)).map(buildProduct),
	);

	return { data: hydrated };
};

const productGet = async ({ idOrSlug }: { idOrSlug: string }) => {
	const product = await getProductInternal(idOrSlug);
	if (!product || "deleted" in product) {
		return null;
	}

	return buildProduct(product);
};

const collectionBrowse = async ({ limit = 5 }: { limit?: number }) => {
	const { data: products } = await productBrowse({ limit: 100 });

	const collectionMap = products.reduce((acc, product) => {
		product.collections.forEach((collection) => {
			if (!acc.has(collection.slug)) {
				acc.set(collection.slug, {
					id: collection.slug,
					slug: collection.slug,
					name: collection.name,
					description: collection.description ?? null,
					image: collection.image ?? null,
					products: [],
				});
			}

			const existing = acc.get(collection.slug);
			if (existing) {
				existing.products.push(product);
			}
		});
		return acc;
	}, new Map<string, Collection>());

	const collections = Array.from(collectionMap.values());
	return { data: typeof limit === "number" ? collections.slice(0, limit) : collections };
};

const collectionGet = async ({ idOrSlug }: { idOrSlug: string }) => {
	const slug = slugify(idOrSlug);
	const { data: collections } = await collectionBrowse({ limit: undefined });
	return collections.find((collection) => collection.slug === slug) ?? null;
};

const getVariantWithProduct = async (variantId: string) => {
	try {
		const price = await stripe.prices.retrieve(variantId, {
			expand: ["product"],
		});

		if (!price || price.deleted || !price.product || typeof price.product === "string") {
			return null;
		}

		const product = await buildProduct(price.product);
		const variant = product.variants.find((v) => v.id === variantId);

		if (!variant) {
			return null;
		}

		return { product, variant };
	} catch {
		return null;
	}
};

export const commerce = {
	productBrowse,
	productGet,
	collectionBrowse,
	collectionGet,
	getVariantWithProduct,
};
