import { Suspense } from "react";
import { Hero } from "@//components/sections/hero";
import { ProductGrid } from "@//components/sections/product-grid";

function ProductGridSkeleton() {
	return (
		<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
			<div className="mb-12 flex items-end justify-between">
				<div>
					<div className="h-8 w-48 animate-pulse rounded bg-secondary" />
					<div className="mt-2 h-5 w-64 animate-pulse rounded bg-secondary" />
				</div>
			</div>
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

export default function Home() {
	return (
		<main>
			<Hero />
			<Suspense fallback={<ProductGridSkeleton />}>
				<ProductGrid title="Featured Products" limit={6} />
			</Suspense>
		</main>
	);
}
