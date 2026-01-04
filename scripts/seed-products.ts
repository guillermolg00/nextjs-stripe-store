import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../src/db/db";
import {
	collections,
	productCollections,
	products,
	productVariants,
	type SyncStatus,
} from "../src/db/schema";
import { pushProductToStripe } from "../src/lib/product-sync";
import { slugify } from "../src/lib/utils";
import {
	collections as seedCollections,
	products as seedProducts,
} from "./seed-data";

async function seed() {
	console.log("🌱 Starting product seed...\n");

	// 1. Seed collections
	console.log("📁 Seeding collections...");
	const collectionMap = new Map<string, string>();

	for (const col of seedCollections) {
		const existing = await db.query.collections.findFirst({
			where: eq(collections.slug, col.slug),
		});

		if (existing) {
			await db
				.update(collections)
				.set({
					name: col.name,
					description: col.description,
					image: col.image,
					updatedAt: new Date(),
				})
				.where(eq(collections.id, existing.id));
			collectionMap.set(col.slug, existing.id);
			console.log(`  🔄 Updated collection "${col.name}"`);
			continue;
		}

		const id = randomUUID();
		await db.insert(collections).values({
			id,
			slug: col.slug,
			name: col.name,
			description: col.description,
			image: col.image,
		});
		collectionMap.set(col.slug, id);
		console.log(`  ✅ Created collection "${col.name}"`);
	}

	// 2. Seed products
	console.log("\n📦 Seeding products...");

	for (const product of seedProducts) {
		const slug = slugify(product.name);

		const existing = await db.query.products.findFirst({
			where: eq(products.slug, slug),
			with: {
				variants: true,
				productCollections: true,
			},
		});

		let productId: string;
		let isUpdate = false;

		if (existing) {
			productId = existing.id;
			isUpdate = true;

			// Update product metadata
			await db
				.update(products)
				.set({
					name: product.name,
					description: product.description,
					summary: product.summary,
					images: product.images,
					syncStatus: "pending" as SyncStatus,
					updatedAt: new Date(),
				})
				.where(eq(products.id, productId));
			console.log(`  🔄 Updated product "${product.name}"`);

			// Remove old collection links
			await db
				.delete(productCollections)
				.where(eq(productCollections.productId, productId));

			// Remove old variants (they'll be recreated)
			await db
				.delete(productVariants)
				.where(eq(productVariants.productId, productId));
		} else {
			productId = randomUUID();

			// Insert new product
			await db.insert(products).values({
				id: productId,
				slug,
				name: product.name,
				description: product.description,
				summary: product.summary,
				images: product.images,
				syncStatus: "pending" as SyncStatus,
			});
			console.log(`  ✅ Created product "${product.name}"`);
		}

		// Link to collections
		for (const colSlug of product.collectionSlugs) {
			const colId = collectionMap.get(colSlug);
			if (colId) {
				await db.insert(productCollections).values({
					productId,
					collectionId: colId,
				});
				console.log(`     📎 Linked to collection "${colSlug}"`);
			}
		}

		// Insert variants
		for (const variant of product.variants) {
			const variantId = randomUUID();
			const optionLabel = variant.options.map((o) => o.value).join(" / ");

			await db.insert(productVariants).values({
				id: variantId,
				productId,
				price: variant.price,
				currency: variant.currency,
				images: variant.images,
				options: variant.options,
				syncStatus: "pending" as SyncStatus,
			});
			console.log(
				`     🏷️  ${isUpdate ? "Recreated" : "Created"} variant: ${optionLabel}`,
			);
		}

		// Sync to Stripe
		console.log("     🔄 Syncing to Stripe...");
		const syncResult = await pushProductToStripe(productId);
		if (syncResult.success) {
			console.log("     ✅ Synced to Stripe");
		} else {
			console.log(`     ❌ Sync failed: ${syncResult.error}`);
		}
	}

	console.log("\n🎉 Seed completed!");
}

seed()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	});
