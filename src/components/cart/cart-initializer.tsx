"use client";

import { useEffect } from "react";
import type { Cart } from "@//app/cart/types";
import { useCart } from "@//components/cart/use-cart";

export function CartInitializer({ cart }: { cart: Cart | null }) {
	const sync = useCart((state) => state.sync);

	useEffect(() => {
		sync(cart);
	}, [cart, sync]);

	return null;
}
