import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	metadata: jsonb("metadata").$type<Record<string, any>>(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

// Orders
export type OrderStatus =
	| "pending"
	| "paid"
	| "fulfilled"
	| "cancelled"
	| "refunded"
	| "partially_refunded";

export type ShippingAddress = {
	name: string;
	line1: string;
	line2?: string | null;
	city: string;
	state?: string | null;
	postalCode: string;
	country: string;
};

export const orders = pgTable("orders", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
	stripeSessionId: text("stripe_session_id").notNull().unique(),
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	status: text().$type<OrderStatus>().notNull().default("pending"),
	subtotal: text().notNull(),
	tax: text(),
	shipping: text(),
	total: text().notNull(),
	currency: text().notNull(),
	refundedAmount: text("refunded_amount"),
	customerEmail: text("customer_email"),
	shippingAddress: jsonb("shipping_address").$type<ShippingAddress>(),
	metadata: jsonb().$type<Record<string, string>>(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type VariantInfo = {
	label: string;
	value: string;
}[];

export const orderItems = pgTable("order_items", {
	id: text().primaryKey().notNull(),
	orderId: text("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	stripePriceId: text("stripe_price_id").notNull(),
	stripeProductId: text("stripe_product_id").notNull(),
	productName: text("product_name").notNull(),
	productImage: text("product_image"),
	variantInfo: jsonb("variant_info").$type<VariantInfo>(),
	quantity: integer().notNull(),
	unitPrice: text("unit_price").notNull(),
	total: text().notNull(),
	currency: text().notNull(),
});
