"server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db";
import { account, session, users, verification } from "../db/schema";

const authSecret =
	process.env.BETTER_AUTH_SECRET ??
	process.env.AUTH_SECRET ??
	"dev-secret-please-change-me-and-make-it-long-enough-for-better-auth";

export const auth = betterAuth({
	baseURL: process.env.NEXT_PUBLIC_ROOT_URL ?? "http://localhost:3000",
	secret: authSecret,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: users,
			session,
			account,
			verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
});
