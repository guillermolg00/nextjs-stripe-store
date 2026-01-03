"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/components/cart/use-cart";
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { QuantitySelector } from "./quantity-selector";
import { TrustBadges } from "./trust-badges";
import { VariantSelector } from "./variant-selector";

type Variant = {
	id: string;
	price: string;
	currency: string;
	images: string[];
	combinations: {
		variantValue: {
			id: string;
			value: string;
			colorValue: string | null;
			variantType: {
				id: string;
				type: "string" | "color";
				label: string;
			};
		};
	}[];
};

type AddToCartButtonProps = {
	variants: Variant[];
	product: {
		id: string;
		name: string;
		slug: string;
		images: string[];
	};
};

const locale = DEFAULT_LOCALE;

export function AddToCartButton({ variants, product }: AddToCartButtonProps) {
	const searchParams = useSearchParams();
	const [quantity, setQuantity] = useState(1);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const openCart = useCart((state) => state.openCart);
	const add = useCart((state) => state.add);
	const sync = useCart((state) => state.sync);

	const selectedVariant = useMemo(() => {
		if (variants.length === 1) {
			return variants[0];
		}

		if (searchParams.size === 0) {
			return undefined;
		}

		const paramsOptions: Record<string, string> = {};
		searchParams.forEach((valueName, key) => {
			paramsOptions[key] = valueName;
		});

		return variants.find((variant) =>
			variant.combinations.every(
				(combination) =>
					paramsOptions[combination.variantValue.variantType.label] ===
					combination.variantValue.value,
			),
		);
	}, [variants, searchParams]);

	const totalPrice = selectedVariant
		? BigInt(selectedVariant.price) * BigInt(quantity)
		: null;

	const buttonText = useMemo(() => {
		if (isPending) return "Adding...";
		if (!selectedVariant) return "Select options";
		const currency = selectedVariant.currency ?? DEFAULT_CURRENCY;
		if (totalPrice) {
			return `Add to Cart — ${formatMoney({ amount: totalPrice, currency, locale })}`;
		}
		return "Add to Cart";
	}, [isPending, selectedVariant, totalPrice]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedVariant) return;

		openCart();

		startTransition(async () => {
			setError(null);
			add({
				quantity,
				productVariant: {
					id: selectedVariant.id,
					price: selectedVariant.price,
					currency: selectedVariant.currency,
					images: selectedVariant.images,
					combinations: selectedVariant.combinations,
					product,
				},
			});

			const result = await addToCart(selectedVariant.id, quantity);

			if (result?.cart) {
				sync(result.cart);
			}

			if (!result?.success) {
				setError(result?.error ?? "Unable to add this item to your cart.");
				return;
			}

			setQuantity(1);
		});
	};

	return (
		<div className="space-y-8">
			{variants.length > 1 && (
				<VariantSelector
					variants={variants}
					selectedVariantId={selectedVariant?.id}
				/>
			)}

			<QuantitySelector
				quantity={quantity}
				onQuantityChange={setQuantity}
				disabled={isPending}
			/>

			<form onSubmit={handleSubmit}>
				<button
					type="submit"
					disabled={isPending || !selectedVariant}
					className="h-14 w-full rounded-full bg-foreground px-8 py-4 font-medium text-base text-primary-foreground tracking-wide transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{buttonText}
				</button>
			</form>
			{error && <p className="text-destructive text-sm">{error}</p>}

			<TrustBadges />
		</div>
	);
}
