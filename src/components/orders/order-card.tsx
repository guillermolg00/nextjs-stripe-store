import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import type { OrderWithItems } from "@/types/order";

type OrderCardProps = {
	order: OrderWithItems;
	locale?: string;
};

export function OrderCard({ order, locale = "en-US" }: OrderCardProps) {
	const formattedDate = new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(order.createdAt));

	const formattedTotal = formatMoney({
		amount: order.total,
		currency: order.currency,
		locale,
	});

	const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

	return (
		<Link href={`/orders/${order.id}`} prefetch={true}>
			<Card className="cursor-pointer transition-colors hover:bg-muted/50">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<Package className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="font-medium text-sm">
									Order #{order.id.slice(0, 8).toUpperCase()}
								</p>
								<p className="text-muted-foreground text-xs">{formattedDate}</p>
							</div>
						</div>
						<OrderStatusBadge status={order.status} />
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							{itemCount} {itemCount === 1 ? "item" : "items"}
						</span>
						<span className="font-semibold">{formattedTotal}</span>
					</div>
					{order.items.length > 0 && (
						<div className="-space-x-2 mt-3 flex">
							{order.items.slice(0, 4).map((item) => (
								<div
									key={item.id}
									className="h-8 w-8 overflow-hidden rounded-full border-2 border-background bg-muted"
								>
									{item.productImage ? (
										<Image
											src={item.productImage}
											alt={item.productName}
											width={32}
											height={32}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
											{item.productName.charAt(0)}
										</div>
									)}
								</div>
							))}
							{order.items.length > 4 && (
								<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground text-xs">
									+{order.items.length - 4}
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}
