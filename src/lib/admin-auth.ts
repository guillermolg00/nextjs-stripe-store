import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";

type AdminAuthResult =
	| { user: typeof users.$inferSelect }
	| { error: string; status: number };

export async function requireAdmin(
	request: NextRequest,
): Promise<AdminAuthResult> {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return { error: "Unauthorized: Must be logged in", status: 401 };
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, session.user.id),
	});

	if (!user || user.role !== "ADMIN") {
		return { error: "Unauthorized: Admin access required", status: 403 };
	}

	return { user };
}

export function unauthorizedResponse(authResult: {
	error: string;
	status: number;
}) {
	return NextResponse.json(
		{ error: authResult.error },
		{ status: authResult.status },
	);
}
