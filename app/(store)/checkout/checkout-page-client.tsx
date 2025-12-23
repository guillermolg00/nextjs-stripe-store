"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useShallow } from "zustand/shallow";
import { startCheckout } from "@/app/cart/actions";
import { getCurrency, getItems, getSubtotal, useCart } from "@/components/cart/use-cart";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

const locale = process.env.NEXT_PUBLIC_LOCALE ?? "en-US";

export function CheckoutPageClient() {
	const { items, subtotal, currency } = useCart(
		useShallow((state) => ({
			items: getItems(state),
			subtotal: getSubtotal(state),
			currency: getCurrency(state),
		})),
	);
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const handleCheckout = () => {
		setError(null);
		startTransition(async () => {
			const result = await startCheckout();
			if (result?.success && result.url) {
				router.push(result.url);
				return;
			}
			setError("Unable to start checkout. Please try again.");
		});
	};

	if (items.length === 0) {
		return (
			<div className="space-y-4">
				<p className="text-lg font-medium">Your cart is empty.</p>
				<Button asChild variant="outline">
					<Link href="/">Back to shopping</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Review your items and proceed to secure Stripe checkout.
				</p>
			</div>
			<div className="rounded-xl border border-border p-6 space-y-4">
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Items</span>
					<span className="text-sm font-medium">{items.length}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-base font-medium">Subtotal</span>
					<span className="text-base font-semibold">
						{formatMoney({ amount: subtotal, currency, locale })}
					</span>
				</div>
				<p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
				<Button className="w-full" disabled={isPending} onClick={handleCheckout}>
					{isPending ? "Redirecting..." : "Start Checkout"}
				</Button>
				{error && <p className="text-xs text-destructive">{error}</p>}
			</div>
		</div>
	);
}
