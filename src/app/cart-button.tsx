"use client";

import { ShoppingCart } from "lucide-react";
import { useShallow } from "zustand/shallow";
import { getItemCount, useCart } from "@//components/cart/use-cart";

export function CartButton() {
	const { itemCount, openCart } = useCart(
		useShallow((state) => ({
			itemCount: getItemCount(state),
			openCart: state.openCart,
		})),
	);

	return (
		<button
			type="button"
			onClick={openCart}
			className="relative rounded-full p-2 transition-colors hover:bg-secondary"
			aria-label="Shopping cart"
		>
			<ShoppingCart className="h-6 w-6" />
			{itemCount > 0 && (
				<span className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-primary-foreground text-xs">
					{itemCount}
				</span>
			)}
		</button>
	);
}
