import { ArrowRight } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/commerce";
import { commerce } from "@/lib/commerce";

type ProductGridProps = {
	title?: string;
	description?: string;
	products?: Product[];
	limit?: number;
	showViewAll?: boolean;
	viewAllHref?: string;
};

export async function ProductGrid({
	title = "Featured Products",
	description = "Handpicked favorites from our collection",
	products,
	limit = 6,
	showViewAll = true,
	viewAllHref = "/products",
}: ProductGridProps) {
	"use cache";
	cacheLife("seconds");

	const displayProducts =
		products ?? (await commerce.productBrowse({ limit })).data;

	return (
		<section
			id="products"
			className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
		>
			<div className="mb-12 flex items-end justify-between">
				<div>
					<h2 className="font-medium text-2xl text-foreground sm:text-3xl">
						{title}
					</h2>
					<p className="mt-2 text-muted-foreground">{description}</p>
				</div>
				<div className="hidden items-center gap-4 sm:flex">
					<Link
						href="/categories"
						className="inline-flex items-center gap-1 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
						prefetch
					>
						Categories
						<ArrowRight className="h-4 w-4" />
					</Link>
					{showViewAll && (
						<Link
							href={viewAllHref}
							className="inline-flex items-center gap-1 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
							prefetch
						>
							View all
							<ArrowRight className="h-4 w-4" />
						</Link>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{displayProducts.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>

			{showViewAll && (
				<div className="mt-12 flex flex-col items-center gap-4 sm:hidden">
					<Link
						href="/categories"
						className="inline-flex items-center gap-1 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						Browse categories
						<ArrowRight className="h-4 w-4" />
					</Link>
					<Link
						href={viewAllHref}
						className="inline-flex items-center gap-1 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						View all products
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			)}
		</section>
	);
}
