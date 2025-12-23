import { ShoppingCartIcon } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { CartButton } from "@//app/cart-button";
import { commerce } from "@//lib/commerce";
import { NavUser, NavUserFallback } from "./nav-user";

function CartButtonFallback() {
	return (
		<div className="h-10 w-10 rounded-full p-2" aria-description="Loading cart">
			<ShoppingCartIcon className="h-6 w-6 opacity-20" />
		</div>
	);
}

async function NavLinks() {
	"use cache";
	cacheLife("hours");

	const collections = await commerce.collectionBrowse({ limit: 5 });

	return (
		<nav className="hidden items-center gap-6 md:flex">
			<Link
				href="/"
				className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
			>
				Home
			</Link>
			{collections.data.map((collection) => (
				<Link
					key={collection.id}
					href={`/category/${collection.slug}`}
					className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
				>
					{collection.name}
				</Link>
			))}
		</nav>
	);
}

export async function Header() {
	return (
		<header className="sticky top-0 z-50 border-border border-b bg-background/80 backdrop-blur-md">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-8">
						<Link href="/" className="font-bold text-xl">
							Next Stripe Store
						</Link>
						<Suspense>
							<NavLinks />
						</Suspense>
					</div>

					<div className="flex items-center gap-4">
						<Suspense fallback={<CartButtonFallback />}>
							<CartButton />
						</Suspense>
						<Suspense fallback={<NavUserFallback />}>
							<NavUser />
						</Suspense>
					</div>
				</div>
			</div>
		</header>
	);
}
