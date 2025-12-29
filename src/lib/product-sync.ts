"use server";

import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db/db";
import {
	productCollections,
	products,
	productVariants,
	type SyncStatus,
	type VariantOption,
} from "@/db/schema";
import { stripe } from "./commerce";
import { humanizeLabel } from "./utils";

export async function parseCollectionsFromMetadata(
	metadata: Stripe.Metadata,
): Promise<string[]> {
	const raw = metadata.collection ?? metadata.collections ?? "";
	return raw
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);
}

export async function parseVariantOptionsFromMetadata(
	metadata: Stripe.Metadata,
): Promise<VariantOption[]> {
	const optionEntries = Object.entries(metadata ?? {}).filter(
		([key, value]) => key.startsWith("option") && value,
	);

	return optionEntries.map(([key, value]) => {
		const isColor = typeof value === "string" && value.startsWith("#");
		return {
			key,
			label: humanizeLabel(key),
			value: String(value),
			type: isColor ? "color" : "string",
			colorValue: isColor ? String(value) : null,
		} satisfies VariantOption;
	});
}

type PushResult = {
	success: boolean;
	stripeProductId?: string;
	error?: string;
	variantErrors?: string[];
};

export async function pushProductToStripe(
	productId: string,
): Promise<PushResult> {
	const product = await db.query.products.findFirst({
		where: eq(products.id, productId),
		with: { variants: true },
	});

	if (!product) {
		return { success: false, error: "Product not found" };
	}

	try {
		let stripeProduct: Stripe.Product;

		const productColls = await db.query.productCollections.findMany({
			where: eq(productCollections.productId, productId),
			with: { collection: true },
		});
		const collectionNames = productColls
			.map((pc) => pc.collection.name)
			.join(", ");

		const stripeMetadata: Stripe.MetadataParam = {
			slug: product.slug,
			...(collectionNames && { collections: collectionNames }),
			...(product.summary && { summary: product.summary }),
			...product.metadata,
		};

		if (product.stripeProductId) {
			stripeProduct = await stripe.products.update(product.stripeProductId, {
				name: product.name,
				description: product.description ?? undefined,
				images: product.images ?? [],
				metadata: stripeMetadata,
				active: product.active,
			});
		} else {
			stripeProduct = await stripe.products.create({
				name: product.name,
				description: product.description ?? undefined,
				images: product.images ?? [],
				metadata: stripeMetadata,
			});

			await db
				.update(products)
				.set({
					stripeProductId: stripeProduct.id,
					updatedAt: new Date(),
				})
				.where(eq(products.id, productId));
		}

		const variantErrors: string[] = [];
		let allVariantsSuccess = true;

		for (const variant of product.variants) {
			const variantResult = await pushVariantToStripe(
				variant.id,
				stripeProduct.id,
			);
			if (!variantResult.success) {
				allVariantsSuccess = false;
				variantErrors.push(
					`Variant ${variant.id}: ${variantResult.error ?? "Unknown error"}`,
				);
			}
		}

		if (allVariantsSuccess) {
			await db
				.update(products)
				.set({
					syncStatus: "synced" as SyncStatus,
					lastSyncedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(products.id, productId));

			return { success: true, stripeProductId: stripeProduct.id };
		}

		await db
			.update(products)
			.set({
				syncStatus: "error" as SyncStatus,
				updatedAt: new Date(),
			})
			.where(eq(products.id, productId));

		return {
			success: false,
			stripeProductId: stripeProduct.id,
			error: "Some variants failed to sync",
			variantErrors,
		};
	} catch (error) {
		console.error("Failed to push product to Stripe:", error);

		await db
			.update(products)
			.set({
				syncStatus: "error" as SyncStatus,
				updatedAt: new Date(),
			})
			.where(eq(products.id, productId));

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function pushVariantToStripe(
	variantId: string,
	stripeProductId: string,
): Promise<{ success: boolean; stripePriceId?: string; error?: string }> {
	const variant = await db.query.productVariants.findFirst({
		where: eq(productVariants.id, variantId),
	});

	if (!variant) {
		return { success: false, error: "Variant not found" };
	}

	try {
		const optionsMetadata: Record<string, string> = {};
		for (const opt of variant.options ?? []) {
			optionsMetadata[opt.key] = opt.value;
		}
		if (variant.images?.[0]) {
			optionsMetadata.image = variant.images[0];
		}

		if (variant.stripePriceId) {
			const existingPrice = await stripe.prices.retrieve(variant.stripePriceId);

			const priceChanged = String(existingPrice.unit_amount) !== variant.price;
			const currencyChanged =
				existingPrice.currency.toUpperCase() !== variant.currency.toUpperCase();

			if (priceChanged || currencyChanged) {
				await stripe.prices.update(variant.stripePriceId, { active: false });

				const newPrice = await stripe.prices.create({
					product: stripeProductId,
					unit_amount: Number(variant.price),
					currency: variant.currency.toLowerCase(),
					metadata: optionsMetadata,
					active: variant.active,
				});

				await db
					.update(productVariants)
					.set({
						stripePriceId: newPrice.id,
						syncStatus: "synced" as SyncStatus,
						lastSyncedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(productVariants.id, variantId));

				return { success: true, stripePriceId: newPrice.id };
			}

			await stripe.prices.update(variant.stripePriceId, {
				metadata: optionsMetadata,
				active: variant.active,
			});

			await db
				.update(productVariants)
				.set({
					syncStatus: "synced" as SyncStatus,
					lastSyncedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(productVariants.id, variantId));

			return { success: true, stripePriceId: variant.stripePriceId };
		}

		const newPrice = await stripe.prices.create({
			product: stripeProductId,
			unit_amount: Number(variant.price),
			currency: variant.currency.toLowerCase(),
			metadata: optionsMetadata,
			active: variant.active,
		});

		await db
			.update(productVariants)
			.set({
				stripePriceId: newPrice.id,
				syncStatus: "synced" as SyncStatus,
				lastSyncedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(productVariants.id, variantId));

		return { success: true, stripePriceId: newPrice.id };
	} catch (error) {
		console.error("Failed to push variant to Stripe:", error);

		await db
			.update(productVariants)
			.set({
				syncStatus: "error" as SyncStatus,
				updatedAt: new Date(),
			})
			.where(eq(productVariants.id, variantId));

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function archiveProductInStripe(
	productId: string,
): Promise<PushResult> {
	const product = await db.query.products.findFirst({
		where: eq(products.id, productId),
		with: { variants: true },
	});

	if (!product?.stripeProductId) {
		return { success: true };
	}

	try {
		for (const variant of product.variants) {
			if (variant.stripePriceId) {
				await stripe.prices.update(variant.stripePriceId, { active: false });
			}
		}

		await stripe.products.update(product.stripeProductId, { active: false });

		return { success: true, stripeProductId: product.stripeProductId };
	} catch (error) {
		console.error("Failed to archive product in Stripe:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
