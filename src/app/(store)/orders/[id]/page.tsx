import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { OrderSummary } from "@/components/orders/order-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { getOrderById } from "@/lib/orders";

const locale = DEFAULT_LOCALE;

type OrderDetailPageProps = {
	params: Promise<{ id: string }>;
};

async function OrderContent({ orderId }: { orderId: string }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user?.id) {
		redirect("/login");
	}

	const order = await getOrderById(orderId);

	if (!order) {
		notFound();
	}

	if (order.userId && order.userId !== session.user.id) {
		notFound();
	}

	return <OrderSummary order={order} locale={locale} />;
}

function OrderSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="lg:col-span-2">
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-4">
							<Skeleton className="h-16 w-16 rounded-lg" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
						<div className="flex gap-4">
							<Skeleton className="h-16 w-16 rounded-lg" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
						</CardContent>
					</Card>
				</div>
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default function OrderDetailPage(props: OrderDetailPageProps) {
	return (
		<main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-6">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link href="/orders">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Orders
					</Link>
				</Button>
			</div>

			<Suspense fallback={<OrderSkeleton />}>
				<OrderDetailContent {...props} />
			</Suspense>
		</main>
	);
}

async function OrderDetailContent({ params }: OrderDetailPageProps) {
	const { id } = await params;
	return <OrderContent orderId={id} />;
}
