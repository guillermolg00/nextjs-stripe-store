"use client";

import { useEffect, useRef } from "react";
import { clearCart } from "@/app/cart/actions";

export function ClearCartEffect() {
	const cleared = useRef(false);

	useEffect(() => {
		if (!cleared.current) {
			cleared.current = true;
			clearCart();
		}
	}, []);

	return null;
}
