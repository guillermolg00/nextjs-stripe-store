import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import {
	productCollections,
	products,
	productVariants,
	type SyncStatus,
	type VariantOption,
} from "@/db/schema";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { pushProductToStripe } from "@/lib/product-sync";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	const allProducts = await db.query.products.findMany({
		with: {
			variants: true,
			productCollections: {
				with: { collection: true },
			},
		},
		orderBy: (products, { desc }) => [desc(products.createdAt)],
	});

	return NextResponse.json({ data: allProducts });
}

type CreateProductBody = {
	name: string;
	description?: string | null;
	summary?: string | null;
	images?: string[];
	metadata?: Record<string, string>;
	collectionIds?: string[];
	variants?: {
		price: string;
		currency?: string;
		images?: string[];
		options?: VariantOption[];
	}[];
};

export async function POST(request: NextRequest) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	try {
		const body = (await request.json()) as CreateProductBody;

		if (!body.name) {
			return NextResponse.json(
				{ error: "Product name is required" },
				{ status: 400 },
			);
		}

		const id = randomUUID();
		const slug = slugify(body.name);

		const existingSlug = await db.query.products.findFirst({
			where: eq(products.slug, slug),
		});

		if (existingSlug) {
			return NextResponse.json(
				{ error: "A product with this name already exists" },
				{ status: 400 },
			);
		}

		await db.insert(products).values({
			id,
			slug,
			name: body.name,
			description: body.description,
			summary: body.summary,
			images: body.images ?? [],
			metadata: body.metadata,
			syncStatus: "pending" as SyncStatus,
		});

		if (body.collectionIds?.length) {
			await db.insert(productCollections).values(
				body.collectionIds.map((collectionId) => ({
					productId: id,
					collectionId,
				})),
			);
		}

		if (body.variants?.length) {
			await db.insert(productVariants).values(
				body.variants.map((v) => ({
					id: randomUUID(),
					productId: id,
					price: v.price,
					currency: v.currency?.toUpperCase() ?? "USD",
					images: v.images ?? [],
					options: v.options ?? [],
					syncStatus: "pending" as SyncStatus,
				})),
			);
		}

		const syncResult = await pushProductToStripe(id);

		const createdProduct = await db.query.products.findFirst({
			where: eq(products.id, id),
			with: {
				variants: true,
				productCollections: {
					with: { collection: true },
				},
			},
		});

		return NextResponse.json(
			{
				data: createdProduct,
				syncStatus: syncResult.success ? "synced" : "error",
				syncError: syncResult.error,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("POST /api/admin/products error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to create product",
			},
			{ status: 500 },
		);
	}
}
