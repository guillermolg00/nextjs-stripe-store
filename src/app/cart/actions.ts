"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { Cart, CartLineItem } from "@/app/cart/types";
import { auth } from "@/lib/auth";
import { commerce, stripe } from "@/lib/commerce";
import { DEFAULT_CURRENCY } from "@/lib/constants";

const CART_COOKIE_NAME = "cart";
const CART_ID_COOKIE = "cartId";
const CART_TTL = 60 * 60 * 24 * 30; // 30 days
const allowedShippingCountries = [
	"US",
	"CA",
	"GB",
	"DE",
	"FR",
	"ES",
	"IT",
	"NL",
	"AU",
] as const;

type StoredCart = {
	id: string;
	currency: string | null;
	items: {
		priceId: string;
		quantity: number;
	}[];
};

const readCartCookie = async () => {
	const cookieStore = await cookies();
	const raw = cookieStore.get(CART_COOKIE_NAME)?.value;

	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw) as StoredCart;
		if (!parsed.id || !Array.isArray(parsed.items)) {
			return null;
		}

		return {
			id: parsed.id,
			currency: parsed.currency ?? null,
			items: parsed.items
				.map((item) => ({
					priceId: item.priceId,
					quantity: Number(item.quantity),
				}))
				.filter((item) => Number.isFinite(item.quantity) && item.quantity > 0),
		} satisfies StoredCart;
	} catch {
		return null;
	}
};

const persistCart = async (cart: StoredCart) => {
	const cookieStore = await cookies();
	const serialized = JSON.stringify(cart);

	cookieStore.set(CART_COOKIE_NAME, serialized, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: CART_TTL,
		path: "/",
	});

	cookieStore.set(CART_ID_COOKIE, cart.id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: CART_TTL,
		path: "/",
	});
};

const buildCart = async (
	storedCart: StoredCart | null,
): Promise<Cart | null> => {
	if (!storedCart) {
		return null;
	}

	const items = await Promise.all(
		storedCart.items.map(async ({ priceId, quantity }) => {
			const result = await commerce.getVariantWithProduct(priceId);
			if (!result) {
				return null;
			}

			const { product, variant } = result;
			return {
				quantity,
				productVariant: {
					...variant,
					product: {
						id: product.id,
						name: product.name,
						slug: product.slug,
						images: product.images,
					},
				},
			} satisfies CartLineItem;
		}),
	);

	const validItems = items.filter(Boolean) as CartLineItem[];
	const currency =
		storedCart.currency ??
		validItems[0]?.productVariant.currency ??
		DEFAULT_CURRENCY;

	return {
		id: storedCart.id,
		lineItems: validItems,
		currency,
	};
};

const ensureCurrency = (cart: StoredCart | null, currency: string) => {
	if (!cart) {
		return true;
	}

	return !cart.currency || cart.currency === currency;
};

export async function getCart() {
	const cart = await buildCart(await readCartCookie());
	return cart;
}

export async function addToCart(variantId: string, quantity = 1) {
	const storedCart = await readCartCookie();
	const variantWithProduct = await commerce.getVariantWithProduct(variantId);

	if (!variantWithProduct) {
		return { success: false, cart: null, error: "Variant not found" };
	}

	const { variant } = variantWithProduct;

	if (!ensureCurrency(storedCart, variant.currency)) {
		return {
			success: false,
			cart: null,
			error: "Mixed currency carts are not supported",
		};
	}

	const newCart: StoredCart = storedCart ?? {
		id: randomUUID(),
		currency: variant.currency,
		items: [],
	};

	const existingItem = newCart.items.find((item) => item.priceId === variantId);
	if (existingItem) {
		existingItem.quantity += quantity;
	} else {
		newCart.items.push({ priceId: variantId, quantity });
	}

	newCart.currency = variant.currency;
	await persistCart(newCart);

	const hydratedCart = await buildCart(newCart);
	return { success: true, cart: hydratedCart };
}

export async function removeFromCart(variantId: string) {
	const storedCart = await readCartCookie();
	if (!storedCart) {
		return { success: false, cart: null };
	}

	const filteredItems = storedCart.items.filter(
		(item) => item.priceId !== variantId,
	);
	const updatedCart = { ...storedCart, items: filteredItems };

	await persistCart(updatedCart);
	const hydratedCart = await buildCart(updatedCart);
	return { success: true, cart: hydratedCart };
}

// Set absolute quantity for a cart item
export async function setCartQuantity(variantId: string, quantity: number) {
	const storedCart = await readCartCookie();
	if (!storedCart) {
		return { success: false, cart: null };
	}

	const updatedItems = storedCart.items
		.map((item) => {
			if (item.priceId === variantId) {
				return { ...item, quantity };
			}
			return item;
		})
		.filter((item) => item.quantity > 0);

	const updatedCart = { ...storedCart, items: updatedItems };
	await persistCart(updatedCart);

	const hydratedCart = await buildCart(updatedCart);
	return { success: true, cart: hydratedCart };
}

export async function clearCart() {
	const cookieStore = await cookies();
	cookieStore.delete(CART_COOKIE_NAME);
	cookieStore.delete(CART_ID_COOKIE);
	return { success: true };
}

export async function startCheckout() {
	const userSession = await auth.api.getSession({
		headers: await headers(),
	});
	const cart = await getCart();

	if (!cart || cart.lineItems.length === 0) {
		return { success: false, url: null, error: "Cart is empty" };
	}

	const shippingOptions = process.env.STRIPE_SHIPPING_RATE_ID
		? [{ shipping_rate: process.env.STRIPE_SHIPPING_RATE_ID }]
		: [
				{
					shipping_rate_data: {
						display_name: "Standard shipping",
						type: "fixed_amount" as const,
						fixed_amount: {
							amount: 0,
							currency: cart.currency.toLowerCase(),
						},
					},
				},
			];

	const baseUrl = process.env.NEXT_PUBLIC_ROOT_URL ?? "http://localhost:3000";
	const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
	const cancelUrl = `${baseUrl}/checkout/cancel`;

	try {
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items: cart.lineItems.map((item) => ({
				price: item.productVariant.id,
				quantity: item.quantity,
			})),
			client_reference_id: userSession?.user?.id ?? undefined,
			customer_email: userSession?.user?.email ?? undefined,
			metadata: {
				cartId: cart.id,
			},
			success_url: successUrl,
			cancel_url: cancelUrl,
			automatic_tax: { enabled: true },
			shipping_address_collection: {
				allowed_countries: [...allowedShippingCountries],
			},
			shipping_options: shippingOptions,
			allow_promotion_codes: true,
		});

		return { success: true, url: session.url };
	} catch (error) {
		console.error("Failed to create checkout session", error);
		return { success: false, url: null, error: "Unable to start checkout" };
	}
}
