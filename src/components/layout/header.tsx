import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CartButton } from "@/components/cart/cart-button";
import { SITE_NAME } from "@/lib/constants";
import { NavUser, NavUserFallback } from "./nav-user";

function CartButtonFallback() {
	return (
		<div className="h-10 w-10 rounded-full p-2" aria-description="Loading cart">
			<ShoppingCartIcon className="h-6 w-6 opacity-20" />
		</div>
	);
}

async function NavLinks() {
	return (
		<nav className="hidden items-center gap-6 md:flex">
			<Link
				href="/"
				className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
			>
				Home
			</Link>
			<Link
				href="/categories"
				className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
			>
				Categories
			</Link>
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
							{SITE_NAME}
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
