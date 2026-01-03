import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClearCartEffect } from "@/components/checkout/clear-cart-effect";
import { OrderDetails } from "@/components/orders/order-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { createOrderFromSession, getOrderBySessionId } from "@/lib/orders";

const locale = DEFAULT_LOCALE;

type CheckoutSuccessPageProps = {
	searchParams: { session_id?: string };
};

function BasicOrderConfirmation({
	orderId,
	total,
	currency,
}: {
	orderId?: string;
	total?: string;
	currency?: string;
}) {
	return (
		<Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
			<CardContent className="py-12 text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
					<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
				</div>
				<h2 className="mb-2 font-semibold text-green-800 text-xl dark:text-green-200">
					Thank you for your order!
				</h2>
				{orderId && (
					<p className="mb-2 text-green-700 text-sm dark:text-green-300">
						Order #{orderId.slice(0, 8).toUpperCase()} confirmed
					</p>
				)}
				{total && currency && (
					<p className="mb-4 font-medium text-green-800 dark:text-green-200">
						Total: {formatMoney({ amount: total, currency, locale })}
					</p>
				)}
				<p className="mb-6 text-green-700 text-sm dark:text-green-300">
					You'll receive a confirmation email shortly with your order details.
				</p>
				<div className="flex flex-col justify-center gap-3 sm:flex-row">
					<Button asChild>
						<Link href="/">
							<ShoppingBag className="mr-2 h-4 w-4" />
							Continue Shopping
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

async function OrderContent({ sessionId }: { sessionId: string }) {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	});

	let order = await getOrderBySessionId(sessionId);

	if (!order) {
		try {
			order = await createOrderFromSession({
				stripeSessionId: sessionId,
				userId: userSession?.user?.id,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes("duplicate key")) {
				order = await getOrderBySessionId(sessionId);
			} else {
				console.error(
					"[Checkout Success] Failed to create order from session:",
					error,
				);
			}
		}
	}

	if (!order) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<CheckCircle className="h-8 w-8 text-primary" />
					</div>
					<h2 className="mb-2 font-semibold text-xl">Payment Successful!</h2>
					<p className="mb-6 text-muted-foreground">
						Your order is being processed. You'll receive a confirmation email
						shortly.
					</p>
					<div className="flex flex-col justify-center gap-3 sm:flex-row">
						<Button asChild>
							<Link href="/">
								<ShoppingBag className="mr-2 h-4 w-4" />
								Continue Shopping
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	const isOwner =
		userSession?.user?.id != null && order.userId === userSession.user.id;

	if (!isOwner) {
		return (
			<>
				<ClearCartEffect />
				<BasicOrderConfirmation
					orderId={order.id}
					total={order.total}
					currency={order.currency}
				/>
			</>
		);
	}

	return (
		<div className="space-y-8">
			<ClearCartEffect />
			<Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
							<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<CardTitle className="text-green-800 dark:text-green-200">
								Thank you for your order!
							</CardTitle>
							<p className="text-green-700 text-sm dark:text-green-300">
								Order #{order.id.slice(0, 8).toUpperCase()} confirmed
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-green-700 text-sm dark:text-green-300">
						We've received your order and will send you an email confirmation at{" "}
						<strong>{order.customerEmail}</strong>.
					</p>
				</CardContent>
			</Card>

			<OrderDetails order={order} locale={locale} />

			<div className="flex flex-col justify-center gap-3 sm:flex-row">
				<Button asChild variant="outline">
					<Link href={`/orders/${order.id}`}>
						<Package className="mr-2 h-4 w-4" />
						View Order Details
					</Link>
				</Button>
				<Button asChild>
					<Link href="/">
						<ShoppingBag className="mr-2 h-4 w-4" />
						Continue Shopping
					</Link>
				</Button>
			</div>
		</div>
	);
}

function OrderSkeleton() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<Skeleton className="h-12 w-12 rounded-full" />
					<Skeleton className="h-6 w-48" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-4 w-full" />
				</CardContent>
			</Card>
			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<Skeleton className="h-6 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
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
			</div>
		</div>
	);
}

async function SuccessPageContent({
	searchParams,
}: {
	searchParams: { session_id?: string };
}) {
	const { session_id: sessionId } = searchParams;

	if (!sessionId) {
		redirect("/");
	}

	return <OrderContent sessionId={sessionId} />;
}

export default function CheckoutSuccessPage({
	searchParams,
}: CheckoutSuccessPageProps) {
	return (
		<main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
			<Suspense fallback={<OrderSkeleton />}>
				<SuccessPageContent searchParams={searchParams} />
			</Suspense>
		</main>
	);
}
