"server-only";
import { betterAuth } from "better-auth/minimal";
import { Pool } from "pg";

const authSecret =
	process.env.BETTER_AUTH_SECRET ??
	process.env.AUTH_SECRET ??
	"dev-secret-please-change-me-and-make-it-long-enough-for-better-auth";

export const auth = betterAuth({
	baseURL: process.env.NEXT_PUBLIC_ROOT_URL ?? "http://localhost:3000",
	secret: authSecret,
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
	}),
	emailAndPassword: {
		enabled: true,
	},
});
