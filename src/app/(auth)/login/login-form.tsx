"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@//components/ui/button";
import { Input } from "@//components/ui/input";
import { authClient } from "@//lib/auth-client";

export function LoginForm() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsPending(true);
		setError(null);

		try {
			const result = await authClient.signIn.email({
				email,
				password,
			});
			if ("error" in result && result.error) {
				setError(result.error.message ?? "Unable to sign in");
			} else {
				router.push("/");
			}
		} catch {
			setError("Unable to sign in. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label
					className="mb-2 block font-medium text-foreground text-sm"
					htmlFor="email"
				>
					Email
				</label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					placeholder="you@example.com"
				/>
			</div>
			<div>
				<label
					className="mb-2 block font-medium text-foreground text-sm"
					htmlFor="password"
				>
					Password
				</label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					placeholder="••••••••"
				/>
			</div>
			{error && <p className="text-destructive text-sm">{error}</p>}
			<Button type="submit" className="w-full" disabled={isPending}>
				{isPending ? "Signing in..." : "Sign In"}
			</Button>
		</form>
	);
}
