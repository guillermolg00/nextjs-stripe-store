import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/db/schema";

type OrderStatusBadgeProps = {
	status: OrderStatus;
};

const statusConfig: Record<
	OrderStatus,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	}
> = {
	pending: { label: "Pending", variant: "outline" },
	paid: { label: "Paid", variant: "default" },
	fulfilled: { label: "Fulfilled", variant: "secondary" },
	cancelled: { label: "Cancelled", variant: "destructive" },
	refunded: { label: "Refunded", variant: "destructive" },
	partially_refunded: { label: "Partially Refunded", variant: "outline" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	const config = statusConfig[status] ?? statusConfig.pending;

	return <Badge variant={config.variant}>{config.label}</Badge>;
}
