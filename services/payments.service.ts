import { startCheckout } from "@/app/cart/actions";
import { stripe } from "@/lib/commerce";

export const paymentsService = {
	startCheckout,
	stripe,
};
