"server-only";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db/db";
import {
	type OrderStatus,
	orderItems,
	orders,
	type ShippingAddress,
	type VariantInfo,
} from "@/db/schema";
import { stripe } from "@/lib/commerce";

export type OrderWithItems = typeof orders.$inferSelect & {
	items: (typeof orderItems.$inferSelect)[];
};

export type CreateOrderInput = {
	stripeSessionId: string;
	userId?: string | null;
};

/**
 * Creates an order from a completed Stripe checkout session.
 * Retrieves session data from Stripe and persists to database.
 */
export async function createOrderFromSession({
	stripeSessionId,
	userId,
}: CreateOrderInput): Promise<OrderWithItems | null> {
	const existing = await db
		.select()
		.from(orders)
		.where(eq(orders.stripeSessionId, stripeSessionId))
		.limit(1);

	if (existing[0]) {
		return getOrderById(existing[0].id);
	}

	const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
		expand: ["line_items.data.price.product", "payment_intent"],
	});

	if (!session.line_items?.data) {
		console.error("No line items found in session", stripeSessionId);
		return null;
	}

	const orderId = randomUUID();
	const now = new Date();

	const shippingDetails = session.shipping_details;
	const shippingAddress: ShippingAddress | null = shippingDetails?.address
		? {
				name: shippingDetails.name ?? "",
				line1: shippingDetails.address.line1 ?? "",
				line2: shippingDetails.address.line2,
				city: shippingDetails.address.city ?? "",
				state: shippingDetails.address.state,
				postalCode: shippingDetails.address.postal_code ?? "",
				country: shippingDetails.address.country ?? "",
			}
		: null;

	const paymentIntentId =
		typeof session.payment_intent === "string"
			? session.payment_intent
			: (session.payment_intent?.id ?? null);

	// Calculate totals - use explicit null check to preserve 0 values
	const subtotal = String(session.amount_subtotal ?? 0);
	const tax =
		session.total_details?.amount_tax != null
			? String(session.total_details.amount_tax)
			: null;
	const shipping =
		session.total_details?.amount_shipping != null
			? String(session.total_details.amount_shipping)
			: null;
	const total = String(session.amount_total ?? 0);

	const status: OrderStatus =
		session.payment_status === "paid" ? "paid" : "pending";

	const itemsToInsert = session.line_items.data.map((lineItem) => {
		const price = lineItem.price;
		const product = price?.product as Stripe.Product | undefined;

		const variantInfo: VariantInfo = [];
		if (price?.metadata) {
			Object.entries(price.metadata)
				.filter(([key]) => key.startsWith("option"))
				.forEach(([key, value]) => {
					variantInfo.push({
						label: key.replace(/^option[_-]?/i, "").replace(/[_-]+/g, " "),
						value: String(value),
					});
				});
		}

		return {
			id: randomUUID(),
			orderId,
			stripePriceId: price?.id ?? "",
			stripeProductId: product?.id ?? "",
			productName: product?.name ?? lineItem.description ?? "Unknown Product",
			productImage: product?.images?.[0] ?? null,
			variantInfo: variantInfo.length > 0 ? variantInfo : null,
			quantity: lineItem.quantity ?? 1,
			unitPrice: String(price?.unit_amount ?? 0),
			total: String(lineItem.amount_total ?? 0),
			currency: price?.currency?.toUpperCase() ?? "USD",
		};
	});

	await db.transaction(async (tx) => {
		await tx.insert(orders).values({
			id: orderId,
			userId: userId ?? session.client_reference_id ?? null,
			stripeSessionId,
			stripePaymentIntentId: paymentIntentId,
			status,
			subtotal,
			tax,
			shipping,
			total,
			currency: session.currency?.toUpperCase() ?? "USD",
			customerEmail: session.customer_email ?? session.customer_details?.email,
			shippingAddress,
			metadata: (session.metadata as Record<string, string>) ?? null,
			createdAt: now,
			updatedAt: now,
		});

		if (itemsToInsert.length > 0) {
			await tx.insert(orderItems).values(itemsToInsert);
		}
	});

	return getOrderById(orderId);
}

/**
 * Retrieves an order by ID with all its items.
 */
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
	const [order] = await db.select().from(orders).where(eq(orders.id, id));

	if (!order) {
		return null;
	}

	const items = await db
		.select()
		.from(orderItems)
		.where(eq(orderItems.orderId, id));

	return { ...order, items };
}

/**
 * Retrieves an order by Stripe session ID.
 */
export async function getOrderBySessionId(
	stripeSessionId: string,
): Promise<OrderWithItems | null> {
	const [order] = await db
		.select()
		.from(orders)
		.where(eq(orders.stripeSessionId, stripeSessionId));

	if (!order) {
		return null;
	}

	return getOrderById(order.id);
}

/**
 * Retrieves all orders for a user, sorted by creation date (newest first).
 */
export async function getOrdersByUser(
	userId: string,
): Promise<OrderWithItems[]> {
	const userOrders = await db
		.select()
		.from(orders)
		.where(eq(orders.userId, userId))
		.orderBy(orders.createdAt);

	const ordersDesc = userOrders.reverse();

	const ordersWithItems = await Promise.all(
		ordersDesc.map(async (order) => {
			const items = await db
				.select()
				.from(orderItems)
				.where(eq(orderItems.orderId, order.id));
			return { ...order, items };
		}),
	);

	return ordersWithItems;
}

/**
 * Updates the status of an order.
 */
export async function updateOrderStatus(
	id: string,
	status: OrderStatus,
): Promise<void> {
	await db
		.update(orders)
		.set({ status, updatedAt: new Date() })
		.where(eq(orders.id, id));
}

/**
 * Updates the status of an order by payment intent ID.
 */
export async function updateOrderStatusByPaymentIntent(
	paymentIntentId: string,
	status: OrderStatus,
): Promise<void> {
	await db
		.update(orders)
		.set({ status, updatedAt: new Date() })
		.where(eq(orders.stripePaymentIntentId, paymentIntentId));
}

/**
 * Updates the refund status and amount of an order by payment intent ID.
 */
export async function updateOrderRefund(
	paymentIntentId: string,
	status: OrderStatus,
	refundedAmount: string,
): Promise<void> {
	await db
		.update(orders)
		.set({ status, refundedAmount, updatedAt: new Date() })
		.where(eq(orders.stripePaymentIntentId, paymentIntentId));
}
