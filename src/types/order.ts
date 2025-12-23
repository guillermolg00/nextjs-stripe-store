export type OrderStatus = "created" | "paid" | "fulfilled" | "cancelled" | "refunded";

export type Order = {
	id: string;
	status: OrderStatus;
	total: string;
	currency: string;
	createdAt: string;
	updatedAt: string;
};
