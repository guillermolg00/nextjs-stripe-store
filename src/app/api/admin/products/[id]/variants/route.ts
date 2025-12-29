import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import {
	products,
	productVariants,
	type SyncStatus,
	type VariantOption,
} from "@/db/schema";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { pushVariantToStripe } from "@/lib/product-sync";

type RouteParams = { params: Promise<{ id: string }> };

type CreateVariantBody = {
	price: string;
	currency?: string;
	images?: string[];
	options?: VariantOption[];
	active?: boolean;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	const { id: productId } = await params;

	try {
		const body = (await request.json()) as CreateVariantBody;

		if (!body.price) {
			return NextResponse.json(
				{ error: "Variant price is required" },
				{ status: 400 },
			);
		}

		const product = await db.query.products.findFirst({
			where: eq(products.id, productId),
		});

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		const variantId = randomUUID();

		await db.insert(productVariants).values({
			id: variantId,
			productId,
			price: body.price,
			currency: body.currency?.toUpperCase() ?? "USD",
			images: body.images ?? [],
			options: body.options ?? [],
			active: body.active ?? true,
			syncStatus: "pending" as SyncStatus,
		});

		let syncResult: { success: boolean; error?: string } = {
			success: false,
			error: "Product not synced to Stripe",
		};
		if (product.stripeProductId) {
			syncResult = await pushVariantToStripe(
				variantId,
				product.stripeProductId,
			);
		}

		const variant = await db.query.productVariants.findFirst({
			where: eq(productVariants.id, variantId),
		});

		return NextResponse.json(
			{
				data: variant,
				syncStatus: syncResult.success ? "synced" : "error",
				syncError: syncResult.error,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("POST /api/admin/products/:id/variants error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to create variant",
			},
			{ status: 500 },
		);
	}
}
