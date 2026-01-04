import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrderHistory } from "@/components/orders/order-history";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/orders";

async function OrdersList() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user?.id) {
		redirect("/login");
	}

	const orders = await getOrdersByUser(session.user.id);

	return (
		<div className="space-y-4">
			<OrderHistory orders={orders} />
		</div>
	);
}

function OrdersSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2, 3].map((i) => (
				<Card key={i}>
					<CardContent className="py-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
							<Skeleton className="h-6 w-16" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export default function OrdersPage() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl tracking-tight">My Orders</h1>
				<p className="mt-1 text-muted-foreground">
					View and track your order history
				</p>
			</div>

			<Suspense fallback={<OrdersSkeleton />}>
				<OrdersList />
			</Suspense>
		</main>
	);
}
