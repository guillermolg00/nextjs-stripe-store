import type { Product, ProductVariant } from "@/lib/commerce";

export type CartLineItem = {
	quantity: number;
	productVariant: ProductVariant & {
		product: Pick<Product, "id" | "name" | "slug" | "images">;
	};
};

export type Cart = {
	id: string;
	currency: string;
	lineItems: CartLineItem[];
};
