"use client";

import { createAuthClient } from "better-auth/client/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_ROOT_URL,
});
