import { auth } from "@/lib/auth";

export const authService = {
	signUpEmail: async (body: { email: string; password: string; name?: string }) =>
		auth.api.signUpEmail({ body }),
	signInEmail: async (body: { email: string; password: string }) => auth.api.signInEmail({ body }),
	getSession: async () => auth.api.getSession(),
};
