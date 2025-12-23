"use client";

import { authClient } from "./auth.client";

export const useSession = authClient.useSession;

export const signInEmail = async (email: string, password: string) =>
	authClient.signIn.email({
		email,
		password,
	});

export const signUpEmail = async (email: string, password: string, name?: string) =>
	authClient.signUp.email({
		email,
		password,
		name,
	});
