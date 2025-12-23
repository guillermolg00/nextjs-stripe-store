import { cookies } from "next/headers";
import { Suspense } from "react";
import { getCart } from "@/app/cart/actions";
import { CartSidebar } from "@/app/cart/cart-sidebar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartProvider } from "@/features/cart/cart.store";
import "@/app/globals.css";

async function CartLoader({ children }: { children: React.ReactNode }) {
	const cart = await getCart();
	const cartId = cart?.id ?? (await cookies()).get("cartId")?.value ?? null;

	return (
		<CartProvider initialCart={cart ?? null} initialCartId={cartId}>
			{children}
			<CartSidebar />
		</CartProvider>
	);
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="antialiased">
			<Suspense
				fallback={
					<CartProvider initialCart={null} initialCartId={null}>
						<div className="flex min-h-screen flex-col">
							<Header />
							<div className="flex-1">{children}</div>
							<Footer />
						</div>
					</CartProvider>
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
