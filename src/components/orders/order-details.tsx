import { MapPin, Package } from "lucide-react";
import Image from "next/image";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import type { OrderWithItems } from "@/types/order";

type OrderDetailsProps = {
	order: OrderWithItems;
	locale?: string;
};

export function OrderDetails({ order, locale = "en-US" }: OrderDetailsProps) {
	const formattedDate = new Intl.DateTimeFormat(locale, {
		dateStyle: "full",
		timeStyle: "short",
	}).format(new Date(order.createdAt));

	const formatPrice = (amount: string | null, currency: string) => {
		if (!amount) return "—";
		return formatMoney({ amount, currency, locale });
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">
						Order #{order.id.slice(0, 8).toUpperCase()}
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">{formattedDate}</p>
				</div>
				<OrderStatusBadge status={order.status} />
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Order Items */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Package className="h-5 w-5" />
							Order Items
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{order.items.map((item, index) => (
							<div key={item.id}>
								{index > 0 && <Separator className="my-4" />}
								<div className="flex gap-4">
									<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
										{item.productImage ? (
											<Image
												src={item.productImage}
												alt={item.productName}
												width={64}
												height={64}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-muted-foreground">
												<Package className="h-6 w-6" />
											</div>
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{item.productName}</p>
										{item.variantInfo && item.variantInfo.length > 0 && (
											<p className="text-muted-foreground text-sm">
												{item.variantInfo.map((v) => v.value).join(" / ")}
											</p>
										)}
										<p className="text-muted-foreground text-sm">
											Qty: {item.quantity} ×{" "}
											{formatPrice(item.unitPrice, item.currency)}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium">
											{formatPrice(item.total, item.currency)}
										</p>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Summary & Shipping */}
				<div className="space-y-6">
					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>{formatPrice(order.subtotal, order.currency)}</span>
							</div>
							{order.shipping && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Shipping</span>
									<span>{formatPrice(order.shipping, order.currency)}</span>
								</div>
							)}
							{order.tax && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tax</span>
									<span>{formatPrice(order.tax, order.currency)}</span>
								</div>
							)}
							<Separator />
							<div className="flex justify-between font-semibold">
								<span>Total</span>
								<span>{formatPrice(order.total, order.currency)}</span>
							</div>
						</CardContent>
					</Card>

					{/* Shipping Address */}
					{order.shippingAddress && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<MapPin className="h-5 w-5" />
									Shipping Address
								</CardTitle>
							</CardHeader>
							<CardContent>
								<address className="space-y-1 text-muted-foreground text-sm not-italic">
									<p className="font-medium text-foreground">
										{order.shippingAddress.name}
									</p>
									<p>{order.shippingAddress.line1}</p>
									{order.shippingAddress.line2 && (
										<p>{order.shippingAddress.line2}</p>
									)}
									<p>
										{order.shippingAddress.city}
										{order.shippingAddress.state &&
											`, ${order.shippingAddress.state}`}{" "}
										{order.shippingAddress.postalCode}
									</p>
									<p>{order.shippingAddress.country}</p>
								</address>
							</CardContent>
						</Card>
					)}

					{/* Contact */}
					{order.customerEmail && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Contact</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">
									{order.customerEmail}
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
