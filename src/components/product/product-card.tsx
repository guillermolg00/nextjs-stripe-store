import Image from "next/image";
import Link from "next/link";
import type { Product } from "@//lib/commerce";
import { formatMoney } from "@//lib/money";

const locale = process.env.NEXT_PUBLIC_LOCALE ?? "en-US";

export function ProductCard({ product }: { product: Product }) {
	const variants = product.variants;
	const prices = variants.map((variant) => BigInt(variant.price));
	const currency = variants[0]?.currency ?? "USD";
	const minPrice = prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : null;
	const maxPrice = prices.length > 0 ? prices.reduce((a, b) => (a > b ? a : b)) : null;

	const priceDisplay =
		prices.length > 1 && minPrice !== null && maxPrice !== null && minPrice !== maxPrice
			? `${formatMoney({ amount: minPrice, currency, locale })} - ${formatMoney({ amount: maxPrice, currency, locale })}`
			: minPrice !== null
				? formatMoney({ amount: minPrice, currency, locale })
				: null;

	const allImages = [
		...product.images,
		...variants.flatMap((variant) => variant.images ?? []).filter((image) => !product.images.includes(image)),
	];
	const primaryImage = allImages[0];
	const secondaryImage = allImages[1];

	return (
		<Link key={product.id} href={`/product/${product.slug}`} className="group">
			<div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden mb-4">
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
				<h3 className="text-base font-medium text-foreground">{product.name}</h3>
				<p className="text-base font-semibold text-foreground">{priceDisplay}</p>
			</div>
		</Link>
	);
}
