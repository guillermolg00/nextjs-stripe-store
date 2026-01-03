"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useShallow } from "zustand/shallow";
import { startCheckout } from "@/app/cart/actions";
import { CartItem } from "@/components/cart/cart-item";
import {
	getCurrency,
	getItemCount,
	getItems,
	getSubtotal,
	useCart,
} from "@/components/cart/use-cart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

const locale = DEFAULT_LOCALE;

export function CartSidebar() {
	const router = useRouter();

	const isOpen = useCart((state) => state.isOpen);
	const closeCart = useCart((state) => state.closeCart);
	const items = useCart(useShallow((state) => getItems(state)));
	const itemCount = useCart(useShallow((state) => getItemCount(state)));
	const subtotal = useCart(useShallow((state) => getSubtotal(state)));
	const currency = useCart(useShallow((state) => getCurrency(state)));

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

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
			<SheetContent className="flex w-full flex-col sm:max-w-lg">
				<SheetHeader className="border-border border-b pb-4">
					<SheetTitle className="flex items-center gap-2">
						Your Cart
						{itemCount > 0 && (
							<span className="font-normal text-muted-foreground text-sm">
								({itemCount} items)
							</span>
						)}
					</SheetTitle>
				</SheetHeader>

				{items.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
							<ShoppingBag className="h-10 w-10 text-muted-foreground" />
						</div>
						<div className="text-center">
							<p className="font-medium text-lg">Your cart is empty</p>
							<p className="mt-1 text-muted-foreground text-sm">
								Add some products to get started
							</p>
						</div>
						<Button variant="outline" onClick={closeCart}>
							Continue Shopping
						</Button>
					</div>
				) : (
					<>
						<ScrollArea className="flex-1 px-4">
							<div className="divide-y divide-border">
								{items.map((item) => (
									<CartItem key={item.productVariant.id} item={item} />
								))}
							</div>
						</ScrollArea>

						<SheetFooter className="mt-auto border-border border-t pt-4">
							<div className="w-full space-y-4">
								<div className="flex items-center justify-between text-base">
									<span className="font-medium">Subtotal</span>
									<span className="font-semibold">
										{formatMoney({ amount: subtotal, currency, locale })}
									</span>
								</div>
								<p className="text-muted-foreground text-xs">
									Shipping and taxes calculated at checkout
								</p>
								<Button
									className="h-12 w-full font-medium text-base"
									onClick={handleCheckout}
									disabled={items.length === 0 || isPending}
								>
									{isPending ? "Redirecting..." : "Checkout"}
								</Button>
								{error && <p className="text-destructive text-xs">{error}</p>}
								<button
									type="button"
									onClick={closeCart}
									className="w-full text-muted-foreground text-sm transition-colors hover:text-foreground"
								>
									Continue Shopping
								</button>
							</div>
						</SheetFooter>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
