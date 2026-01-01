"use client";

import { format } from "date-fns";
import { ChevronRight, Package, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderWithItems } from "@/lib/orders";
import { cn } from "@/lib/utils";

const statusConfig: Record<
	OrderWithItems["status"],
	{ label: string; color: string; dotColor: string }
> = {
	pending: {
		label: "Processing",
		color: "text-amber-600",
		dotColor: "bg-amber-500",
	},
	paid: {
		label: "In Transit",
		color: "text-blue-600",
		dotColor: "bg-blue-500",
	},
	fulfilled: {
		label: "Delivered",
		color: "text-emerald-600",
		dotColor: "bg-emerald-500",
	},
	refunded: {
		label: "Returned",
		color: "text-muted-foreground",
		dotColor: "bg-muted-foreground",
	},
	cancelled: {
		label: "Cancelled",
		color: "text-red-600",
		dotColor: "bg-red-500",
	},
	partially_refunded: {
		label: "Partially Refunded",
		color: "text-purple-600",
		dotColor: "bg-purple-500",
	},
};

interface OrderHistory5Props {
	orders?: OrderWithItems[];
	className?: string;
}

const OrderHistory = ({ orders = [], className }: OrderHistory5Props) => {
	const [activeTab, setActiveTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	};

	const filteredOrders = orders.filter((order) => {
		const matchesTab =
			activeTab === "all" ||
			(activeTab === "active" &&
				(order.status === "fulfilled" || order.status === "paid")) ||
			order.status === activeTab;

		const matchesSearch =
			searchQuery === "" ||
			order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			order.items.some((item) =>
				item.productName.toLowerCase().includes(searchQuery.toLowerCase()),
			);

		return matchesTab && matchesSearch;
	});

	return (
		<section className={cn("py-16 md:py-24", className)}>
			<div className="container max-w-4xl">
				{/* Header */}
				<div className="mb-8">
					<h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
						Your Orders
					</h1>
					<p className="mt-1 text-muted-foreground">
						Track, return, or buy items again
					</p>
				</div>

				{/* Filters */}
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList>
							<TabsTrigger value="all">All Orders</TabsTrigger>
							<TabsTrigger value="active">In Progress</TabsTrigger>
							<TabsTrigger value="delivered">Delivered</TabsTrigger>
							<TabsTrigger value="returned">Returns</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
						<Input
							placeholder="Search orders..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 sm:w-64"
						/>
					</div>
				</div>

				{/* Orders */}
				<div className="space-y-6">
					{filteredOrders.map((order) => {
						const status = statusConfig[order.status];

						return (
							<Card
								key={order.id}
								className="gap-0 overflow-hidden p-0 shadow-none"
							>
								{/* Order Header */}
								<div
									className={cn(
										"flex flex-wrap items-center justify-between gap-4 px-5 py-4",
										!(order.status === "fulfilled" && order.shipping) &&
											"border-b",
									)}
								>
									<div className="flex flex-wrap items-center gap-x-5 gap-y-1">
										<div>
											<p className="text-muted-foreground text-xs">
												Order placed
											</p>
											<p className="font-medium text-sm">
												{format(new Date(order.createdAt), "PPP")}
											</p>
										</div>
										<Separator orientation="vertical" className="h-8" />
										<div>
											<p className="text-muted-foreground text-xs">
												Order number
											</p>
											<p className="font-medium text-sm">{order.id}</p>
										</div>
										<Separator orientation="vertical" className="h-8" />
										<div>
											<p className="text-muted-foreground text-xs">Total</p>
											<p className="font-medium text-sm">
												{formatPrice(Number(order.total))}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span
											className={cn("size-2 rounded-full", status.dotColor)}
										/>
										<span className={cn("font-medium text-sm", status.color)}>
											{status.label}
										</span>
									</div>
								</div>

								{/* Order Items */}
								<CardContent className="p-0">
									{order.items.map((item, index) => (
										<div key={item.id}>
											{index > 0 && <Separator />}
											<div className="flex gap-5 p-5">
												{/* Image */}
												<div className="size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
													<AspectRatio ratio={1}>
														<Image
															src={item.productImage!}
															alt={item.productName}
															className="size-full object-cover"
														/>
													</AspectRatio>
												</div>

												{/* Item Details */}
												<div className="flex min-w-0 flex-1 flex-col">
													<div className="flex items-start justify-between gap-3">
														<div>
															<h3 className="font-medium">
																{item.productName}
															</h3>
															<p className="mt-1 text-muted-foreground text-sm">
																{item.variantInfo
																	?.map((v) => v.label)
																	.join(" · ")}
																{item.quantity > 1 && ` · Qty ${item.quantity}`}
															</p>
														</div>
														<p className="shrink-0 font-semibold text-sm">
															{formatPrice(Number(item.unitPrice))}
														</p>
													</div>
												</div>
											</div>
										</div>
									))}
								</CardContent>

								{/* Order Footer */}
								<div className="flex items-center justify-between border-t bg-muted/20 px-5 py-3">
									<Button
										variant="link"
										size="sm"
										className="h-auto p-0 text-foreground"
									>
										View order details
										<ChevronRight className="ml-1 size-4" />
									</Button>
									<Button variant="ghost" size="sm">
										Need Help?
									</Button>
								</div>
							</Card>
						);
					})}

					{/* Empty State */}
					{filteredOrders.length === 0 && (
						<Card className="gap-0 p-0 shadow-none">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
									<Package className="size-6 text-muted-foreground" />
								</div>
								<h2 className="font-semibold text-lg">No orders found</h2>
								<p className="mt-1 text-muted-foreground text-sm">
									{searchQuery
										? `No results for "${searchQuery}"`
										: "You haven't placed any orders yet"}
								</p>
								<Button className="mt-5">Start Shopping</Button>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</section>
	);
};

export { OrderHistory };
