import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import {
	productVariants,
	type SyncStatus,
	type VariantOption,
} from "@/db/schema";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { pushVariantToStripe } from "@/lib/product-sync";

type RouteParams = { params: Promise<{ id: string }> };

type UpdateVariantBody = {
	price?: string;
	currency?: string;
	images?: string[];
	options?: VariantOption[];
	active?: boolean;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	const { id } = await params;

	try {
		const body = (await request.json()) as UpdateVariantBody;

		const variant = await db.query.productVariants.findFirst({
			where: eq(productVariants.id, id),
			with: { product: true },
		});

		if (!variant) {
			return NextResponse.json({ error: "Variant not found" }, { status: 404 });
		}

		await db
			.update(productVariants)
			.set({
				...(body.price && { price: body.price }),
				...(body.currency && { currency: body.currency.toUpperCase() }),
				...(body.images && { images: body.images }),
				...(body.options && { options: body.options }),
				...(body.active !== undefined && { active: body.active }),
				syncStatus: "pending" as SyncStatus,
				updatedAt: new Date(),
			})
			.where(eq(productVariants.id, id));

		let syncResult: { success: boolean; error?: string } = {
			success: false,
			error: "Product not synced to Stripe",
		};
		if (variant.product.stripeProductId) {
			syncResult = await pushVariantToStripe(
				id,
				variant.product.stripeProductId,
			);
		}

		const updatedVariant = await db.query.productVariants.findFirst({
			where: eq(productVariants.id, id),
		});

		return NextResponse.json({
			data: updatedVariant,
			syncStatus: syncResult.success ? "synced" : "error",
			syncError: syncResult.error,
		});
	} catch (error) {
		console.error("PATCH /api/admin/variants/:id error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to update variant",
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
		const variant = await db.query.productVariants.findFirst({
			where: eq(productVariants.id, id),
		});

		if (!variant) {
			return NextResponse.json({ error: "Variant not found" }, { status: 404 });
		}

		await db
			.update(productVariants)
			.set({
				active: false,
				updatedAt: new Date(),
			})
			.where(eq(productVariants.id, id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("DELETE /api/admin/variants/:id error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to delete variant",
			},
			{ status: 500 },
		);
	}
}
