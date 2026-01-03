"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useShallow } from "zustand/shallow";
import { startCheckout } from "@/app/cart/actions";
import {
	getCurrency,
	getItems,
	getSubtotal,
	useCart,
} from "@/components/cart/use-cart";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

const locale = DEFAULT_LOCALE;

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
			setError(result?.error ?? "Unable to start checkout. Please try again.");
		});
	};

	if (items.length === 0) {
		return (
			<div className="space-y-4">
				<p className="font-medium text-lg">Your cart is empty.</p>
				<Button asChild variant="outline">
					<Link href="/">Back to shopping</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-3xl tracking-tight">Checkout</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Review your items and proceed to secure Stripe checkout.
				</p>
			</div>
			<div className="space-y-4 rounded-xl border border-border p-6">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-sm">Items</span>
					<span className="font-medium text-sm">{items.length}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="font-medium text-base">Subtotal</span>
					<span className="font-semibold text-base">
						{formatMoney({ amount: subtotal, currency, locale })}
					</span>
				</div>
				<p className="text-muted-foreground text-xs">
					Shipping and taxes calculated at checkout
				</p>
				<Button
					className="w-full"
					disabled={isPending}
					onClick={handleCheckout}
				>
					{isPending ? "Redirecting..." : "Start Checkout"}
				</Button>
				{error && <p className="text-destructive text-xs">{error}</p>}
			</div>
		</div>
	);
}
