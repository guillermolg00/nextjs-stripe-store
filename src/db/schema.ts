import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export type UserRole = "USER" | "ADMIN";

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	role: text().$type<UserRole>().notNull().default("USER"),
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

export type SyncStatus = "pending" | "synced" | "error";

export type VariantOption = {
	key: string; // e.g. "option_color"
	label: string; // e.g. "Color"
	value: string; // e.g. "#FF0000" or "XL"
	type: "string" | "color";
	colorValue?: string | null; // if type === "color"
};

export const products = pgTable("products", {
	id: text().primaryKey().notNull(),
	stripeProductId: text("stripe_product_id").unique(),
	slug: text().notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	summary: text(),
	images: jsonb().$type<string[]>().default([]),
	active: boolean().notNull().default(true),
	metadata: jsonb().$type<Record<string, string>>(),
	syncStatus: text("sync_status")
		.$type<SyncStatus>()
		.notNull()
		.default("pending"),
	lastSyncedAt: timestamp("last_synced_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productVariants = pgTable("product_variants", {
	id: text().primaryKey().notNull(),
	stripePriceId: text("stripe_price_id").unique(),
	productId: text("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	price: text().notNull(), // minor units as string (BigInt compatible)
	currency: text().notNull().default("USD"), // uppercase
	images: jsonb().$type<string[]>().default([]),
	options: jsonb().$type<VariantOption[]>().default([]),
	active: boolean().notNull().default(true),
	syncStatus: text("sync_status")
		.$type<SyncStatus>()
		.notNull()
		.default("pending"),
	lastSyncedAt: timestamp("last_synced_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const collections = pgTable("collections", {
	id: text().primaryKey().notNull(),
	slug: text().notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	image: text(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productCollections = pgTable(
	"product_collections",
	{
		productId: text("product_id")
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		collectionId: text("collection_id")
			.notNull()
			.references(() => collections.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.productId, table.collectionId] })],
);

export const productsRelations = relations(products, ({ many }) => ({
	variants: many(productVariants),
	productCollections: many(productCollections),
}));

export const productVariantsRelations = relations(
	productVariants,
	({ one }) => ({
		product: one(products, {
			fields: [productVariants.productId],
			references: [products.id],
		}),
	}),
);

export const collectionsRelations = relations(collections, ({ many }) => ({
	productCollections: many(productCollections),
}));

export const productCollectionsRelations = relations(
	productCollections,
	({ one }) => ({
		product: one(products, {
			fields: [productCollections.productId],
			references: [products.id],
		}),
		collection: one(collections, {
			fields: [productCollections.collectionId],
			references: [collections.id],
		}),
	}),
);
