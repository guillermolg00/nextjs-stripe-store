import type Stripe from "stripe";
import type { OrderStatus } from "@/db/schema";
import { stripe } from "@/lib/commerce";
import {
	createOrderFromSession,
	updateOrderRefund,
	updateOrderStatusByPaymentIntent,
} from "@/lib/orders";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Handles checkout.session.completed event.
 * Creates an order in the database from the completed session.
 */
async function handleCheckoutCompleted(
	session: Stripe.Checkout.Session,
): Promise<void> {
	console.log("[Stripe Webhook] Checkout completed:", session.id);

	try {
		const order = await createOrderFromSession({
			stripeSessionId: session.id,
			userId: session.client_reference_id,
		});

		if (order) {
			console.log("[Stripe Webhook] Order created:", order.id);
		} else {
			console.error(
				"[Stripe Webhook] Failed to create order for session:",
				session.id,
			);
		}
	} catch (error) {
		console.error("[Stripe Webhook] Error creating order:", error);
		throw error;
	}
}

/**
 * Handles payment_intent.succeeded event.
 * Updates order status to "paid".
 */
async function handlePaymentSucceeded(
	paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
	console.log("[Stripe Webhook] Payment succeeded:", paymentIntent.id);

	try {
		await updateOrderStatusByPaymentIntent(paymentIntent.id, "paid");
		console.log(
			"[Stripe Webhook] Order status updated to paid for payment intent:",
			paymentIntent.id,
		);
	} catch (error) {
		console.error("[Stripe Webhook] Error updating order status:", error);
		throw error;
	}
}

/**
 * Handles charge.refunded event.
 * Updates order status based on whether refund is full or partial.
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
	console.log("[Stripe Webhook] Charge refunded:", charge.id);

	const paymentIntentId =
		typeof charge.payment_intent === "string"
			? charge.payment_intent
			: charge.payment_intent?.id;

	if (paymentIntentId) {
		try {
			const isFullRefund =
				charge.refunded && charge.amount_refunded === charge.amount;
			const status: OrderStatus = isFullRefund
				? "refunded"
				: "partially_refunded";
			const refundedAmount = String(charge.amount_refunded);

			await updateOrderRefund(paymentIntentId, status, refundedAmount);
			console.log(
				`[Stripe Webhook] Order status updated to ${status} (refunded: ${refundedAmount}) for payment intent:`,
				paymentIntentId,
			);
		} catch (error) {
			console.error("[Stripe Webhook] Error updating order status:", error);
			throw error;
		}
	}
}

export async function POST(req: Request): Promise<Response> {
	const body = await req.text();
	const signature = req.headers.get("stripe-signature");

	if (!signature) {
		console.error("[Stripe Webhook] Missing stripe-signature header");
		return new Response("Missing stripe-signature header", { status: 400 });
	}

	if (!webhookSecret) {
		console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET env var");
		return new Response("Webhook secret not configured", { status: 500 });
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("[Stripe Webhook] Signature verification failed:", message);
		return new Response(`Webhook signature verification failed: ${message}`, {
			status: 400,
		});
	}

	console.log("[Stripe Webhook] Received event:", event.type);

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				await handleCheckoutCompleted(session);
				break;
			}

			case "payment_intent.succeeded": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				await handlePaymentSucceeded(paymentIntent);
				break;
			}

			case "charge.refunded": {
				const charge = event.data.object as Stripe.Charge;
				await handleChargeRefunded(charge);
				break;
			}

			default:
				console.log("[Stripe Webhook] Unhandled event type:", event.type);
		}
	} catch (error) {
		console.error("[Stripe Webhook] Error processing event:", error);
		return new Response("Webhook processing failed", { status: 500 });
	}

	return new Response("OK", { status: 200 });
}
