import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/commerce";
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

const locale = DEFAULT_LOCALE;

export function ProductCard({ product }: { product: Product }) {
	const variants = product.variants;
	const prices = variants.map((variant) => BigInt(variant.price));
	const currency = variants[0]?.currency ?? DEFAULT_CURRENCY;
	const minPrice =
		prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : null;
	const maxPrice =
		prices.length > 0 ? prices.reduce((a, b) => (a > b ? a : b)) : null;

	const priceDisplay =
		prices.length > 1 &&
		minPrice !== null &&
		maxPrice !== null &&
		minPrice !== maxPrice
			? `${formatMoney({ amount: minPrice, currency, locale })} - ${formatMoney({ amount: maxPrice, currency, locale })}`
			: minPrice !== null
				? formatMoney({ amount: minPrice, currency, locale })
				: null;

	const allImages = [
		...product.images,
		...variants
			.flatMap((variant) => variant.images ?? [])
			.filter((image) => !product.images.includes(image)),
	];
	const primaryImage = allImages[0];
	const secondaryImage = allImages[1];

	return (
		<Link
			key={product.id}
			href={`/product/${product.slug}`}
			className="group"
			prefetch={true}
		>
			<div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-secondary">
				{primaryImage && (
					<Image
						src={primaryImage}
						alt={product.name}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						className="object-cover transition-opacity duration-500 group-hover:opacity-0"
					/>
				)}
				{secondaryImage && (
					<Image
						src={secondaryImage}
						alt={`${product.name} - alternate view`}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					/>
				)}
			</div>
			<div className="space-y-1">
				<h3 className="font-medium text-base text-foreground">
					{product.name}
				</h3>
				<p className="font-semibold text-base text-foreground">
					{priceDisplay}
				</p>
			</div>
		</Link>
	);
}
