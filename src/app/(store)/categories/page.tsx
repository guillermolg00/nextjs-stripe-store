import { Suspense } from "react";
import { CategoryGrid } from "@/components/category/category-grid";
import { CategoryGridSkeleton } from "@/components/category/category-grid-skeleton";
import { commerce } from "@/lib/commerce";

export const metadata = {
	title: "Categories",
	description: "Explore our product categories",
};

async function CategoriesList() {
	const { data: collections } = await commerce.collectionBrowse({ limit: 100 });
	return <CategoryGrid collections={collections} />;
}

export default function CategoriesPage() {
	return (
		<div>
			<section className="relative overflow-hidden bg-secondary/30">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="py-12 sm:py-16 lg:py-20">
						<div className="max-w-2xl">
							<h1 className="font-medium text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
								Categories
							</h1>
							<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
								Explore our collection of products by category.
							</p>
						</div>
					</div>
				</div>
			</section>
			<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
				<Suspense fallback={<CategoryGridSkeleton />}>
					<CategoriesList />
				</Suspense>
			</section>
		</div>
	);
}
