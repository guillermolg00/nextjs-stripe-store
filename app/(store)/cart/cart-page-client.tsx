"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useShallow } from "zustand/shallow";
import { startCheckout } from "@/app/cart/actions";
import { CartItem } from "@/components/cart/cart-item";
import { getCurrency, getItemCount, getItems, getSubtotal, useCart } from "@/components/cart/use-cart";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

const locale = process.env.NEXT_PUBLIC_LOCALE ?? "en-US";

export function CartPageClient() {
	const router = useRouter();
	const { items, itemCount, subtotal, currency } = useCart(
		useShallow((state) => ({
			items: getItems(state),
			itemCount: getItemCount(state),
			subtotal: getSubtotal(state),
			currency: getCurrency(state),
		})),
	);
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
			<div className="flex flex-col items-center justify-center py-16 gap-4">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
					<ShoppingBag className="h-10 w-10 text-muted-foreground" />
				</div>
				<div className="text-center">
					<p className="text-lg font-medium">Your cart is empty</p>
					<p className="text-sm text-muted-foreground mt-1">Add some products to get started</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/">Continue shopping</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
			<div className="lg:col-span-2 space-y-6">
				<h1 className="text-3xl font-semibold tracking-tight">Shopping Cart</h1>
				<div className="divide-y divide-border rounded-xl border border-border p-4">
					{items.map((item) => (
						<CartItem key={item.productVariant.id} item={item} />
					))}
				</div>
			</div>

			<div className="rounded-xl border border-border p-6 space-y-4 h-fit">
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>Items</span>
					<span>{itemCount}</span>
				</div>
				<div className="flex items-center justify-between text-base">
					<span className="font-medium">Subtotal</span>
					<span className="font-semibold">{formatMoney({ amount: subtotal, currency, locale })}</span>
				</div>
				<p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
				<Button className="w-full" disabled={isPending} onClick={handleCheckout}>
					{isPending ? "Redirecting..." : "Proceed to Checkout"}
				</Button>
				{error && <p className="text-xs text-destructive">{error}</p>}
			</div>
		</div>
	);
}
