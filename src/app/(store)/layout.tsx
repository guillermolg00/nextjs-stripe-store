import { Suspense } from "react";
import { getCart } from "@//app/cart/actions";
import { CartSidebar } from "@//app/cart/cart-sidebar";
import { CartInitializer } from "@//components/cart/cart-initializer";
import { Footer } from "@//components/layout/footer";
import { Header } from "@//components/layout/header";

async function CartLoader({ children }: { children: React.ReactNode }) {
	const cart = await getCart();

	return (
		<>
			<CartInitializer cart={cart ?? null} />
			{children}
			<CartSidebar />
		</>
	);
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="antialiased">
			<Suspense
				fallback={
					<>
						<CartInitializer cart={null} />
						<div className="flex min-h-screen flex-col">
							<Header />
							<div className="flex-1">{children}</div>
							<Footer />
						</div>
						<CartSidebar />
					</>
				}
			>
				<CartLoader>
					<div className="flex min-h-screen flex-col">
						<Header />
						<div className="flex-1">{children}</div>
						<Footer />
					</div>
				</CartLoader>
			</Suspense>
		</div>
	);
}
