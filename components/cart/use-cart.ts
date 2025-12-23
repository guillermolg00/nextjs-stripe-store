"use client";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import type { Cart, CartLineItem } from "@/app/cart/types";
import { calculateSubtotal } from "@/utils/cart";

interface CartStore {
	cart: Cart | null;
	isOpen: boolean;

	openCart: () => void;
	closeCart: () => void;
	add: (item: CartLineItem) => void;
	increase: (variantId: string) => void;
	decrease: (variantId: string) => void;
	remove: (variantId: string) => void;
	sync: (cart: Cart | null) => void;
}

export const useCart = create<CartStore>((set, get) => ({
	cart: null,
	isOpen: false,

	openCart: () => set({ isOpen: true }),
	closeCart: () => set({ isOpen: false }),

	add: (item) => {
		const { cart } = get();

		if (!cart) {
			return set({
				cart: {
					id: "optimistic",
					currency: item.productVariant.currency,
					lineItems: [item],
				},
			});
		}

		const existing = cart.lineItems.find((i) => i.productVariant.id === item.productVariant.id);

		if (existing) {
			return set({
				cart: {
					...cart,
					lineItems: cart.lineItems.map((i) =>
						i.productVariant.id === item.productVariant.id
							? { ...i, quantity: i.quantity + item.quantity }
							: i,
					),
				},
			});
		}

		set({ cart: { ...cart, lineItems: [...cart.lineItems, item] } });
	},

	increase: (variantId) => {
		const { cart } = get();
		if (!cart) return;

		set({
			cart: {
				...cart,
				lineItems: cart.lineItems.map((item) =>
					item.productVariant.id === variantId ? { ...item, quantity: item.quantity + 1 } : item,
				),
			},
		});
	},

	decrease: (variantId) => {
		const { cart } = get();
		if (!cart) return;

		set({
			cart: {
				...cart,
				lineItems: cart.lineItems
					.map((item) =>
						item.productVariant.id === variantId ? { ...item, quantity: item.quantity - 1 } : item,
					)
					.filter((item) => item.quantity > 0),
			},
		});
	},

	remove: (variantId) => {
		const { cart } = get();
		if (!cart) return;

		set({
			cart: {
				...cart,
				lineItems: cart.lineItems.filter((item) => item.productVariant.id !== variantId),
			},
		});
	},

	sync: (cart) => set({ cart }),
}));

// Derived selectors
export const getItems = (state: CartStore) => state.cart?.lineItems ?? [];
export const getItemCount = (state: CartStore) =>
	getItems(state).reduce((sum, item) => sum + item.quantity, 0);
export const getSubtotal = (state: CartStore) => calculateSubtotal(getItems(state));
export const getCurrency = (state: CartStore) =>
	state.cart?.currency ?? getItems(state)[0]?.productVariant.currency ?? "USD";

export type { Cart, CartLineItem };
