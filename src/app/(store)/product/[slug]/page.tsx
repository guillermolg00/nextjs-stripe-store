import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductFeatures } from "@/components/product/product-features";
import { ProductGallery } from "@/components/product/product-gallery";
import { commerce } from "@/lib/commerce";
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

const locale = DEFAULT_LOCALE;

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	return (
		<Suspense>
			<ProductDetails slug={slug} />
		</Suspense>
	);
}

const ProductDetails = async ({ slug }: { slug: string }) => {
	"use cache";
	const product = await commerce.productGet({ idOrSlug: slug });

	if (!product) {
		notFound();
	}

	const prices = product.variants.map((variant) => BigInt(variant.price));
	const currency = product.variants[0]?.currency ?? DEFAULT_CURRENCY;
	const minPrice =
		prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : BigInt(0);
	const maxPrice =
		prices.length > 0 ? prices.reduce((a, b) => (a > b ? a : b)) : BigInt(0);

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
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="lg:grid lg:grid-cols-2 lg:gap-16">
				<ProductGallery images={allImages} productName={product.name} />

				<div className="mt-8 space-y-8 lg:mt-0">
					<div className="space-y-4">
						<h1 className="text-balance font-medium text-4xl text-foreground tracking-tight lg:text-5xl">
							{product.name}
						</h1>
						<p className="font-semibold text-2xl tracking-tight">
							{priceDisplay}
						</p>
						{product.summary && (
							<p className="text-muted-foreground leading-relaxed">
								{product.summary}
							</p>
						)}
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
