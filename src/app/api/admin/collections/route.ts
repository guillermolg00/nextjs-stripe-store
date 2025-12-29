import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { collections } from "@/db/schema";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	const allCollections = await db.query.collections.findMany({
		orderBy: (collections, { desc }) => [desc(collections.createdAt)],
	});

	return NextResponse.json({ data: allCollections });
}

type CreateCollectionBody = {
	name: string;
	description?: string | null;
	image?: string | null;
};

export async function POST(request: NextRequest) {
	const authResult = await requireAdmin(request);
	if ("error" in authResult) {
		return unauthorizedResponse(authResult);
	}

	try {
		const body = (await request.json()) as CreateCollectionBody;

		if (!body.name) {
			return NextResponse.json(
				{ error: "Collection name is required" },
				{ status: 400 },
			);
		}

		const id = randomUUID();
		const slug = slugify(body.name);

		const existingSlug = await db.query.collections.findFirst({
			where: eq(collections.slug, slug),
		});

		if (existingSlug) {
			return NextResponse.json(
				{ error: "A collection with this name already exists" },
				{ status: 400 },
			);
		}

		await db.insert(collections).values({
			id,
			slug,
			name: body.name,
			description: body.description,
			image: body.image,
		});

		const collection = await db.query.collections.findFirst({
			where: eq(collections.id, id),
		});

		return NextResponse.json({ data: collection }, { status: 201 });
	} catch (error) {
		console.error("POST /api/admin/collections error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to create collection",
			},
			{ status: 500 },
		);
	}
}
