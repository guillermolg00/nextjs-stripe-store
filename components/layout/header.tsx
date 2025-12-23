import { ShoppingCartIcon } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { CartButton } from "@/app/cart-button";
import { commerce } from "@/lib/commerce";

function CartButtonFallback() {
	return (
		<div className="p-2 rounded-full w-10 h-10" aria-description="Loading cart">
			<ShoppingCartIcon className="w-6 h-6 opacity-20" />
		</div>
	);
}

async function NavLinks() {
	"use cache";
	cacheLife("hours");

	const collections = await commerce.collectionBrowse({ limit: 5 });

	return (
		<nav className="hidden md:flex items-center gap-6">
			<Link
				href="/"
				className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
			>
				Home
			</Link>
			{collections.data.map((collection) => (
				<Link
					key={collection.id}
					href={`/category/${collection.slug}`}
					className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					{collection.name}
				</Link>
			))}
		</nav>
	);
}

export async function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center gap-8">
						<Link href="/" className="text-xl font-bold">
							Next Stripe Store
						</Link>
						<Suspense>
							<NavLinks />
						</Suspense>
					</div>
					<Suspense fallback={<CartButtonFallback />}>
						<CartButton />
					</Suspense>
				</div>
			</div>
		</header>
	);
}
