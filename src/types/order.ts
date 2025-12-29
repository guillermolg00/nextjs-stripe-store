// Re-export types from schema and orders service for convenience
export type {
	OrderStatus,
	ShippingAddress,
	VariantInfo,
} from "@/db/schema";

export type { OrderWithItems } from "@/lib/orders";

import type { orderItems, orders } from "@/db/schema";

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
