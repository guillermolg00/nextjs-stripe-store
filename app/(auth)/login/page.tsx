import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
	return (
		<main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
				<p className="text-muted-foreground text-sm">Sign in to continue shopping.</p>
			</div>
			<LoginForm />
			<p className="text-sm text-muted-foreground text-center">
				Don&apos;t have an account?{" "}
				<Link href="/register" className="underline hover:text-foreground">
					Create one
				</Link>
			</p>
		</main>
	);
}
