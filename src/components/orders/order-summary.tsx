"use client";

import { CreditCard, Download, MapPin, Package, Printer } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { OrderWithItems } from "@/types/order";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderSummaryProps {
	order: OrderWithItems;
	className?: string;
	locale: string;
}

const OrderSummary = ({ order, className, locale }: OrderSummaryProps) => {
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<section className={cn("pb-16 md:pb-24", className)}>
			<div className="container max-w-3xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-1 font-bold text-2xl tracking-tight md:text-3xl">
						Order Details
					</h1>
					<p className="text-muted-foreground text-sm">
						{formatDate(order.createdAt)}
					</p>
				</div>

				{/* Order Items */}
				<Card className="mb-6 shadow-none">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-base">
							<Package className="size-4" />
							{order.items.length} {order.items.length === 1 ? "Item" : "Items"}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{order.items.map((item, index) => (
							<div key={item.id}>
								<div className="flex gap-4">
									<div className="w-16 shrink-0">
										<AspectRatio
											ratio={1}
											className="overflow-hidden rounded-md bg-muted"
										>
											{item.productImage ? (
												<img
													src={item.productImage}
													alt={item.productName}
													className="size-full object-cover"
												/>
											) : (
												<div className="flex size-full items-center justify-center bg-muted">
													<Package className="size-6 text-muted-foreground" />
												</div>
											)}
										</AspectRatio>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-2">
											<div>
												<h3 className="font-medium text-sm">
													{item.productName}
												</h3>
												{item.variantInfo && item.variantInfo.length > 0 && (
													<p className="text-muted-foreground text-xs">
														{item.variantInfo.map((v, i) => (
															<span key={v.label}>
																{v.value}
																{i < item.variantInfo!.length - 1 && " · "}
															</span>
														))}
													</p>
												)}
												<p className="text-muted-foreground text-xs">
													Qty: {item.quantity}
												</p>
											</div>
											<p className="font-medium text-sm">
												{formatMoney({
													amount: BigInt(item.total),
													currency: item.currency,
													locale: locale,
												})}
											</p>
										</div>
									</div>
								</div>
								{index < order.items.length - 1 && (
									<Separator className="mt-4" />
								)}
							</div>
						))}
					</CardContent>
				</Card>

				{/* Summary Grid */}
				<div className="mb-6 grid gap-6 md:grid-cols-2">
					{/* Shipping */}
					{order.shippingAddress && (
						<Card className="shadow-none">
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<MapPin className="size-4" />
									Delivery
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="font-medium text-sm">
										{order.shippingAddress.name}
									</p>
									<p className="text-muted-foreground text-sm">
										{order.shippingAddress.line1}
									</p>
									<p className="text-muted-foreground text-sm">
										{order.shippingAddress.city}, {order.shippingAddress.state}{" "}
										{order.shippingAddress.postalCode}
									</p>
								</div>
								{order.shippingAddress.country && (
									<>
										<Separator />
										<p className="text-muted-foreground text-sm">
											{order.shippingAddress.country}
										</p>
									</>
								)}
							</CardContent>
						</Card>
					)}

					{/* Payment & Summary */}
					<Card className="shadow-none">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<CreditCard className="size-4" />
								Payment
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<OrderStatusBadge status={order.status} />
							<Separator />
							<div className="space-y-1.5 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span>
										{formatMoney({
											amount: BigInt(order.subtotal),
											currency: order.currency,
											locale: locale,
										})}
									</span>
								</div>
								{order.shipping && order.shipping !== "0" && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Shipping</span>
										<span>
											{formatMoney({
												amount: BigInt(order.shipping),
												currency: order.currency,
												locale: locale,
											})}
										</span>
									</div>
								)}
								{order.tax && order.tax !== "0" && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tax</span>
										<span>
											{formatMoney({
												amount: BigInt(order.tax),
												currency: order.currency,
												locale: locale,
											})}
										</span>
									</div>
								)}
							</div>
							<Separator />
							<div className="flex justify-between font-semibold">
								<span>Total</span>
								<span>
									{formatMoney({
										amount: BigInt(order.total),
										currency: order.currency,
										locale: locale,
									})}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Actions */}
				<div className="flex flex-wrap justify-center gap-3">
					<Button variant="outline">
						<Download className="mr-2 size-4" />
						Download Receipt
					</Button>
					<Button variant="ghost">
						<Printer className="mr-2 size-4" />
						Print
					</Button>
				</div>

				{/* Email Confirmation */}
				{order.customerEmail && (
					<p className="mt-8 text-center text-muted-foreground text-sm">
						A confirmation email has been sent to{" "}
						<span className="font-medium text-foreground">
							{order.customerEmail}
						</span>
					</p>
				)}
			</div>
		</section>
	);
};

export { OrderSummary };
