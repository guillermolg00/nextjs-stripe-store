import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGallery } from "@//components/product/product-gallery";
import { commerce } from "@//lib/commerce";
import { formatMoney } from "@//lib/money";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductFeatures } from "./product-features";

const locale = process.env.NEXT_PUBLIC_LOCALE ?? "en-US";

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
	return (
		<Suspense>
			<ProductDetails params={props.params} />
		</Suspense>
	);
}

const ProductDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {
	"use cache";
	const { slug } = await params;
	const product = await commerce.productGet({ idOrSlug: slug });

	if (!product) {
		notFound();
	}

	const prices = product.variants.map((variant) => BigInt(variant.price));
	const currency = product.variants[0]?.currency ?? "USD";
	const minPrice = prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : BigInt(0);
	const maxPrice = prices.length > 0 ? prices.reduce((a, b) => (a > b ? a : b)) : BigInt(0);

	const priceDisplay =
		prices.length > 1 && minPrice !== maxPrice
			? `${formatMoney({ amount: minPrice, currency, locale })} - ${formatMoney({ amount: maxPrice, currency, locale })}`
			: formatMoney({ amount: minPrice, currency, locale });

	const allImages = [
		...product.images,
		...product.variants
			.flatMap((variant) => variant.images)
			.filter((image) => !product.images.includes(image)),
	];

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="lg:grid lg:grid-cols-2 lg:gap-16">
				<ProductGallery images={allImages} productName={product.name} />

				<div className="mt-8 lg:mt-0 space-y-8">
					<div className="space-y-4">
						<h1 className="text-4xl font-medium tracking-tight text-foreground lg:text-5xl text-balance">
							{product.name}
						</h1>
						<p className="text-2xl font-semibold tracking-tight">{priceDisplay}</p>
						{product.summary && <p className="text-muted-foreground leading-relaxed">{product.summary}</p>}
					</div>

					<AddToCartButton
						variants={product.variants}
						product={{
							id: product.id,
							name: product.name,
							slug: product.slug,
							images: product.images,
						}}
					/>
				</div>
			</div>

			<ProductFeatures />
		</div>
	);
};
