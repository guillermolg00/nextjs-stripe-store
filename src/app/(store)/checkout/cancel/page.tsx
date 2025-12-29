import { ShoppingCart, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutCancelPage() {
	return (
		<main className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
			<Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
						<XCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
					</div>
					<CardTitle className="text-amber-800 text-xl dark:text-amber-200">
						Checkout Cancelled
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6 text-center">
					<p className="text-amber-700 dark:text-amber-300">
						Your checkout session was cancelled. Don't worry, your cart items
						are still saved.
					</p>

					<div className="flex flex-col justify-center gap-3 sm:flex-row">
						<Button asChild variant="outline">
							<Link href="/cart">
								<ShoppingCart className="mr-2 h-4 w-4" />
								Return to Cart
							</Link>
						</Button>
						<Button asChild>
							<Link href="/">Continue Shopping</Link>
						</Button>
					</div>

					<p className="text-muted-foreground text-xs">
						Having trouble? Feel free to contact our support team.
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
