"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useOptimistic, useState } from "react";
import type { Cart, CartLineItem } from "@/app/cart/types";
import { calculateSubtotal } from "./cart.utils";

type CartAction =
	| { type: "INCREASE"; variantId: string }
	| { type: "DECREASE"; variantId: string }
	| { type: "REMOVE"; variantId: string }
	| { type: "ADD_ITEM"; item: CartLineItem }
	| { type: "SYNC"; cart: Cart | null };

type CartContextValue = {
	cart: Cart | null;
	items: CartLineItem[];
	itemCount: number;
	subtotal: bigint;
	currency: string;
	isOpen: boolean;
	cartId: string | null;
	openCart: () => void;
	closeCart: () => void;
	dispatch: (action: CartAction) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
	children: ReactNode;
	initialCart: Cart | null;
	initialCartId: string | null;
};

export function CartProvider({ children, initialCart, initialCartId }: CartProviderProps) {
	const [cartId] = useState<string | null>(initialCartId);
	const [isOpen, setIsOpen] = useState(false);

	const [optimisticCart, dispatchCartAction] = useOptimistic(initialCart, (state, action: CartAction) => {
		if (!state) {
			if (action.type === "ADD_ITEM") {
				return {
					id: "optimistic",
					currency: action.item.productVariant.currency,
					lineItems: [action.item],
				};
			}
			return state;
		}

		switch (action.type) {
			case "INCREASE":
				return {
					...state,
					lineItems: state.lineItems.map((item) =>
						item.productVariant.id === action.variantId ? { ...item, quantity: item.quantity + 1 } : item,
					),
				};

			case "DECREASE":
				return {
					...state,
					lineItems: state.lineItems
						.map((item) => {
							if (item.productVariant.id === action.variantId) {
								if (item.quantity - 1 <= 0) {
									return null;
								}
								return { ...item, quantity: item.quantity - 1 };
							}
							return item;
						})
						.filter((item): item is CartLineItem => item !== null),
				};

			case "REMOVE":
				return {
					...state,
					lineItems: state.lineItems.filter((item) => item.productVariant.id !== action.variantId),
				};

			case "ADD_ITEM": {
				const existingItem = state.lineItems.find(
					(item) => item.productVariant.id === action.item.productVariant.id,
				);

				if (existingItem) {
					return {
						...state,
						currency: state.currency,
						lineItems: state.lineItems.map((item) =>
							item.productVariant.id === action.item.productVariant.id
								? { ...item, quantity: item.quantity + action.item.quantity }
								: item,
						),
					};
				}

				return {
					...state,
					currency: state.currency || action.item.productVariant.currency,
					lineItems: [...state.lineItems, action.item],
				};
			}

			case "SYNC":
				return action.cart ?? null;

			default:
				return state;
		}
	});

	const items = useMemo(() => optimisticCart?.lineItems ?? [], [optimisticCart]);
	const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
	const subtotal = useMemo(() => calculateSubtotal(items), [items]);
	const currency = optimisticCart?.currency ?? items[0]?.productVariant.currency ?? "USD";

	const openCart = useCallback(() => setIsOpen(true), []);
	const closeCart = useCallback(() => setIsOpen(false), []);

	const currentCartId = optimisticCart?.id && optimisticCart.id !== "optimistic" ? optimisticCart.id : cartId;

	const value = useMemo(
		() => ({
			cart: optimisticCart,
			items,
			itemCount,
			subtotal,
			currency,
			isOpen,
			cartId: currentCartId,
			openCart,
			closeCart,
			dispatch: dispatchCartAction,
		}),
		[
			optimisticCart,
			items,
			itemCount,
			subtotal,
			currency,
			isOpen,
			currentCartId,
			openCart,
			closeCart,
			dispatchCartAction,
		],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}

export type { Cart, CartLineItem };
