import Image from "next/image";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Collection } from "@/lib/commerce";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
	collections: Collection[];
	className?: string;
}

export function CategoryGrid({ collections, className }: CategoryGridProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
				className,
			)}
		>
			{collections.map((collection) => (
				<Link key={collection.id} href={`/categories/${collection.slug}`}>
					<Card className="group h-full overflow-hidden border-none pt-0">
						<CardHeader>
							<div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg bg-muted">
								{collection.image ? (
									<Image
										src={collection.image}
										alt={collection.name}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-105"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center">
										<span className="text-muted-foreground">No Image</span>
									</div>
								)}
							</div>
							<CardTitle className="flex items-center justify-between">
								<span>{collection.name}</span>
							</CardTitle>
							<CardDescription>{collection.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-xs">
								{collection.products.length}{" "}
								{collection.products.length === 1 ? "Product" : "Products"}
							</p>
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	);
}
