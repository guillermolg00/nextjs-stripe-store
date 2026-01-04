"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/db";
import {
	collections,
	productCollections,
	products,
	productVariants,
	type SyncStatus,
	users,
	type VariantOption,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
	archiveProductInStripe,
	pushProductToStripe,
	pushVariantToStripe,
} from "@/lib/product-sync";
import { slugify } from "@/lib/utils";

// ============================================================
// Auth helpers
// ============================================================

async function requireAdmin() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		throw new Error("Unauthorized: Must be logged in");
	}

	// Check user role in database
	const user = await db.query.users.findFirst({
		where: eq(users.id, session.user.id),
	});

	if (!user) {
		throw new Error("Unauthorized: User not found");
	}

	if (user.role !== "ADMIN") {
		throw new Error("Unauthorized: Admin access required");
	}

	return session.user;
}

// ============================================================
// Types
// ============================================================

type CreateProductInput = {
	name: string;
	description?: string | null;
	summary?: string | null;
	images?: string[];
	metadata?: Record<string, string>;
	collectionIds?: string[];
};

type UpdateProductInput = Partial<CreateProductInput> & {
	active?: boolean;
};

type CreateVariantInput = {
	productId: string;
	price: string; // minor units as string
	currency?: string;
	images?: string[];
	options?: VariantOption[];
};

type UpdateVariantInput = Partial<Omit<CreateVariantInput, "productId">> & {
	active?: boolean;
};

type ActionResult<T = void> = {
	success: boolean;
	data?: T;
	error?: string;
};

// ============================================================
// Product Actions
// ============================================================

export async function createProduct(
	input: CreateProductInput,
): Promise<ActionResult<{ id: string }>> {
	try {
		await requireAdmin();

		const id = randomUUID();
		const slug = slugify(input.name);

		// Check for slug uniqueness
		const existingSlug = await db.query.products.findFirst({
			where: eq(products.slug, slug),
		});

		if (existingSlug) {
			return {
				success: false,
				error: "A product with this name already exists",
			};
		}

		await db.insert(products).values({
			id,
			slug,
			name: input.name,
			description: input.description,
			summary: input.summary,
			images: input.images ?? [],
			metadata: input.metadata,
			syncStatus: "pending" as SyncStatus,
		});

		// Link to collections if provided
		if (input.collectionIds?.length) {
			await db.insert(productCollections).values(
				input.collectionIds.map((collectionId) => ({
					productId: id,
					collectionId,
				})),
			);
		}

		// Sync to Stripe
		const syncResult = await pushProductToStripe(id);
		if (!syncResult.success) {
			console.warn("Failed to sync product to Stripe:", syncResult.error);
		}

		revalidatePath("/");
		revalidatePath("/products");

		return { success: true, data: { id } };
	} catch (error) {
		console.error("createProduct error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to create product",
		};
	}
}

export async function updateProduct(
	id: string,
	input: UpdateProductInput,
): Promise<ActionResult> {
	try {
		await requireAdmin();

		const existing = await db.query.products.findFirst({
			where: eq(products.id, id),
		});

		if (!existing) {
			return { success: false, error: "Product not found" };
		}

		// Check slug uniqueness if name changed
		let newSlug = existing.slug;
		if (input.name && input.name !== existing.name) {
			newSlug = slugify(input.name);
			const existingSlug = await db.query.products.findFirst({
				where: eq(products.slug, newSlug),
			});

			if (existingSlug && existingSlug.id !== id) {
				return {
					success: false,
					error: "A product with this name already exists",
				};
			}
		}

		await db
			.update(products)
			.set({
				...(input.name && { name: input.name, slug: newSlug }),
				...(input.description !== undefined && {
					description: input.description,
				}),
				...(input.summary !== undefined && { summary: input.summary }),
				...(input.images && { images: input.images }),
				...(input.metadata && { metadata: input.metadata }),
				...(input.active !== undefined && { active: input.active }),
				syncStatus: "pending" as SyncStatus,
				updatedAt: new Date(),
			})
			.where(eq(products.id, id));

		// Update collection links if provided
		if (input.collectionIds) {
			// Remove existing links
			await db
				.delete(productCollections)
				.where(eq(productCollections.productId, id));

			// Add new links
			if (input.collectionIds.length > 0) {
				await db.insert(productCollections).values(
					input.collectionIds.map((collectionId) => ({
						productId: id,
						collectionId,
					})),
				);
			}
		}

		// Sync to Stripe
		const syncResult = await pushProductToStripe(id);
		if (!syncResult.success) {
			console.warn("Failed to sync product to Stripe:", syncResult.error);
		}

		revalidatePath("/");
		revalidatePath("/products");
		revalidatePath(`/product/${newSlug}`);

		return { success: true };
	} catch (error) {
		console.error("updateProduct error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to update product",
		};
	}
}

export async function deleteProduct(id: string): Promise<ActionResult> {
	try {
		await requireAdmin();

		const existing = await db.query.products.findFirst({
			where: eq(products.id, id),
		});

		if (!existing) {
			return { success: false, error: "Product not found" };
		}

		// Soft delete: mark as inactive
		await db
			.update(products)
			.set({
				active: false,
				updatedAt: new Date(),
			})
			.where(eq(products.id, id));

		// Archive in Stripe
		const archiveResult = await archiveProductInStripe(id);
		if (!archiveResult.success) {
			console.warn("Failed to archive product in Stripe:", archiveResult.error);
		}

		revalidatePath("/");
		revalidatePath("/products");

		return { success: true };
	} catch (error) {
		console.error("deleteProduct error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to delete product",
		};
	}
}

// ============================================================
// Variant Actions
// ============================================================

export async function createVariant(
	input: CreateVariantInput,
): Promise<ActionResult<{ id: string }>> {
	try {
		await requireAdmin();

		// Verify product exists
		const product = await db.query.products.findFirst({
			where: eq(products.id, input.productId),
		});

		if (!product) {
			return { success: false, error: "Product not found" };
		}

		const id = randomUUID();

		await db.insert(productVariants).values({
			id,
			productId: input.productId,
			price: input.price,
			currency: input.currency?.toUpperCase() ?? "USD",
			images: input.images ?? [],
			options: input.options ?? [],
			syncStatus: "pending" as SyncStatus,
		});

		// Sync to Stripe (requires product to have stripeProductId)
		if (product.stripeProductId) {
			const syncResult = await pushVariantToStripe(id, product.stripeProductId);
			if (!syncResult.success) {
				console.warn("Failed to sync variant to Stripe:", syncResult.error);
			}
		} else {
			// Push the whole product first
			await pushProductToStripe(product.id);
		}

		revalidatePath("/");
		revalidatePath(`/product/${product.slug}`);

		return { success: true, data: { id } };
	} catch (error) {
		console.error("createVariant error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to create variant",
		};
	}
}

export async function updateVariant(
	id: string,
	input: UpdateVariantInput,
): Promise<ActionResult> {
	try {
		await requireAdmin();

		const existing = await db.query.productVariants.findFirst({
			where: eq(productVariants.id, id),
			with: { product: true },
		});

		if (!existing) {
			return { success: false, error: "Variant not found" };
		}

		await db
			.update(productVariants)
			.set({
				...(input.price !== undefined && { price: input.price }),
				...(input.currency !== undefined && {
					currency: input.currency.toUpperCase(),
				}),
				...(input.images && { images: input.images }),
				...(input.options && { options: input.options }),
				...(input.active !== undefined && { active: input.active }),
				syncStatus: "pending" as SyncStatus,
				updatedAt: new Date(),
			})
			.where(eq(productVariants.id, id));

		// Sync to Stripe
		if (existing.product.stripeProductId) {
			const syncResult = await pushVariantToStripe(
				id,
				existing.product.stripeProductId,
			);
			if (!syncResult.success) {
				console.warn("Failed to sync variant to Stripe:", syncResult.error);
			}
		}

		revalidatePath("/");
		revalidatePath(`/product/${existing.product.slug}`);

		return { success: true };
	} catch (error) {
		console.error("updateVariant error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to update variant",
		};
	}
}

export async function deleteVariant(id: string): Promise<ActionResult> {
	try {
		await requireAdmin();

		const existing = await db.query.productVariants.findFirst({
			where: eq(productVariants.id, id),
			with: { product: true },
		});

		if (!existing) {
			return { success: false, error: "Variant not found" };
		}

		// Soft delete: mark as inactive
		await db
			.update(productVariants)
			.set({
				active: false,
				updatedAt: new Date(),
			})
			.where(eq(productVariants.id, id));

		// Sync to Stripe (archive the price)
		if (existing.product.stripeProductId) {
			const syncResult = await pushVariantToStripe(
				id,
				existing.product.stripeProductId,
			);
			if (!syncResult.success) {
				console.warn("Failed to archive variant in Stripe:", syncResult.error);
			}
		}

		revalidatePath("/");
		revalidatePath(`/product/${existing.product.slug}`);

		return { success: true };
	} catch (error) {
		console.error("deleteVariant error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to delete variant",
		};
	}
}

// ============================================================
// Collection Actions
// ============================================================

type CreateCollectionInput = {
	name: string;
	description?: string | null;
	image?: string | null;
};

type UpdateCollectionInput = Partial<CreateCollectionInput>;

export async function createCollection(
	input: CreateCollectionInput,
): Promise<ActionResult<{ id: string }>> {
	try {
		await requireAdmin();

		const id = randomUUID();
		const slug = slugify(input.name);

		// Check for slug uniqueness
		const existingSlug = await db.query.collections.findFirst({
			where: eq(collections.slug, slug),
		});

		if (existingSlug) {
			return {
				success: false,
				error: "A collection with this name already exists",
			};
		}

		await db.insert(collections).values({
			id,
			slug,
			name: input.name,
			description: input.description,
			image: input.image,
		});

		revalidatePath("/");

		return { success: true, data: { id } };
	} catch (error) {
		console.error("createCollection error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to create collection",
		};
	}
}

export async function updateCollection(
	id: string,
	input: UpdateCollectionInput,
): Promise<ActionResult> {
	try {
		await requireAdmin();

		const existing = await db.query.collections.findFirst({
			where: eq(collections.id, id),
		});

		if (!existing) {
			return { success: false, error: "Collection not found" };
		}

		// Check slug uniqueness if name changed
		let newSlug = existing.slug;
		if (input.name && input.name !== existing.name) {
			newSlug = slugify(input.name);
			const existingSlug = await db.query.collections.findFirst({
				where: eq(collections.slug, newSlug),
			});

			if (existingSlug && existingSlug.id !== id) {
				return {
					success: false,
					error: "A collection with this name already exists",
				};
			}
		}

		await db
			.update(collections)
			.set({
				...(input.name && { name: input.name, slug: newSlug }),
				...(input.description !== undefined && {
					description: input.description,
				}),
				...(input.image !== undefined && { image: input.image }),
				updatedAt: new Date(),
			})
			.where(eq(collections.id, id));

		revalidatePath("/");
		revalidatePath(`/categories/${newSlug}`);

		return { success: true };
	} catch (error) {
		console.error("updateCollection error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to update collection",
		};
	}
}

export async function deleteCollection(id: string): Promise<ActionResult> {
	try {
		await requireAdmin();

		// Hard delete collection (cascade will remove product_collections links)
		await db.delete(collections).where(eq(collections.id, id));

		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("deleteCollection error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to delete collection",
		};
	}
}

// ============================================================
// Sync Actions
// ============================================================

export async function syncProductToStripe(
	productId: string,
): Promise<ActionResult> {
	try {
		await requireAdmin();

		const result = await pushProductToStripe(productId);

		if (!result.success) {
			return { success: false, error: result.error };
		}

		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("syncProductToStripe error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to sync product",
		};
	}
}
