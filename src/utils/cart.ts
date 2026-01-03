import type { CartLineItem } from "@/app/cart/types";

export const calculateSubtotal = (items: CartLineItem[]) =>
	items.reduce(
		(sum, item) =>
			sum + BigInt(item.productVariant.price) * BigInt(item.quantity),
		BigInt(0),
	);
