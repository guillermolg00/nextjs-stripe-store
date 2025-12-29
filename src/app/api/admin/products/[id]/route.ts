import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { productCollections, products, type SyncStatus } from "@/db/schema";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import {
	archiveProductInStripe,
	pushProductToStripe,
} from "@/lib/product-sync";
import { slugify } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	const { id } = await params;

	const product = await db.query.products.findFirst({
		where: eq(products.id, id),
		with: {
			variants: true,
			productCollections: {
				with: { collection: true },
			},
		},
	});

	if (!product) {
		return NextResponse.json({ error: "Product not found" }, { status: 404 });
	}

	return NextResponse.json({ data: product });
}

type UpdateProductBody = {
	name?: string;
	description?: string | null;
	summary?: string | null;
	images?: string[];
	metadata?: Record<string, string>;
	collectionIds?: string[];
	active?: boolean;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	const { id } = await params;

	try {
		const body = (await request.json()) as UpdateProductBody;

		const existing = await db.query.products.findFirst({
			where: eq(products.id, id),
		});

		if (!existing) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		let newSlug = existing.slug;
		if (body.name && body.name !== existing.name) {
			newSlug = slugify(body.name);
			const existingSlug = await db.query.products.findFirst({
				where: eq(products.slug, newSlug),
			});

			if (existingSlug && existingSlug.id !== id) {
				return NextResponse.json(
					{ error: "A product with this name already exists" },
					{ status: 400 },
				);
			}
		}

		await db
			.update(products)
			.set({
				...(body.name && { name: body.name, slug: newSlug }),
				...(body.description !== undefined && {
					description: body.description,
				}),
				...(body.summary !== undefined && { summary: body.summary }),
				...(body.images && { images: body.images }),
				...(body.metadata && { metadata: body.metadata }),
				...(body.active !== undefined && { active: body.active }),
				syncStatus: "pending" as SyncStatus,
				updatedAt: new Date(),
			})
			.where(eq(products.id, id));

		if (body.collectionIds) {
			await db
				.delete(productCollections)
				.where(eq(productCollections.productId, id));

			if (body.collectionIds.length > 0) {
				await db.insert(productCollections).values(
					body.collectionIds.map((collectionId) => ({
						productId: id,
						collectionId,
					})),
				);
			}
		}

		const syncResult = await pushProductToStripe(id);

		const updatedProduct = await db.query.products.findFirst({
			where: eq(products.id, id),
			with: {
				variants: true,
				productCollections: {
					with: { collection: true },
				},
			},
		});

		return NextResponse.json({
			data: updatedProduct,
			syncStatus: syncResult.success ? "synced" : "error",
			syncError: syncResult.error,
		});
	} catch (error) {
		console.error("PATCH /api/admin/products/:id error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to update product",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	const { id } = await params;

	try {
		const existing = await db.query.products.findFirst({
			where: eq(products.id, id),
		});

		if (!existing) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		await db
			.update(products)
			.set({
				active: false,
				updatedAt: new Date(),
			})
			.where(eq(products.id, id));

		const archiveResult = await archiveProductInStripe(id);

		return NextResponse.json({
			success: true,
			archived: archiveResult.success,
		});
	} catch (error) {
		console.error("DELETE /api/admin/products/:id error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to delete product",
			},
			{ status: 500 },
		);
	}
}
