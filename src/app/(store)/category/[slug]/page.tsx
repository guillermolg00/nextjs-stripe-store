import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@//components/sections/product-grid";
import { type Collection, commerce } from "@//lib/commerce";

function CollectionHeader({ collection }: { collection: Collection }) {
	return (
		<section className="relative overflow-hidden bg-secondary/30">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="py-12 sm:py-16 lg:py-20">
					<div className="max-w-2xl">
						<h1 className="font-medium text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
							{collection.name}
						</h1>
						{collection.description && (
							<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
								{collection.description}
							</p>
						)}
					</div>
				</div>
			</div>
			{collection.image && (
				<div className="absolute top-0 right-0 hidden h-full w-1/2 lg:block">
					<Image
						src={collection.image}
						alt={collection.name}
						fill
						className="object-cover opacity-30"
						priority
					/>
					<div className="absolute inset-0 bg-linear-to-r from-secondary/30 to-transparent" />
				</div>
			)}
		</section>
	);
}

function ProductGridSkeleton() {
	return (
		<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={`skeleton-${i}`}>
						<div className="mb-4 aspect-square animate-pulse rounded-2xl bg-secondary" />
						<div className="space-y-2">
							<div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
							<div className="h-5 w-1/4 animate-pulse rounded bg-secondary" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function CollectionProducts({ collection }: { collection: Collection }) {
	const products = collection.products;

	return (
		<ProductGrid
			title={`${collection.name} Collection`}
			description={`${products.length} products`}
			products={products}
			showViewAll={false}
		/>
	);
}

export default async function CategoryPage(
	props: PageProps<"/category/[slug]">,
) {
	const { slug } = await props.params;
	const collection = await commerce.collectionGet({ idOrSlug: slug });

	if (!collection) {
		notFound();
	}

	return (
		<main>
			<CollectionHeader collection={collection} />
			<Suspense fallback={<ProductGridSkeleton />}>
				<CollectionProducts collection={collection} />
			</Suspense>
		</main>
	);
}
