import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
	return (
		<main className="mx-auto max-w-md space-y-6 px-4 py-12 sm:px-6 lg:px-8">
			<div className="space-y-2 text-center">
				<h1 className="font-semibold text-3xl tracking-tight">Welcome back</h1>
				<p className="text-muted-foreground text-sm">
					Sign in to continue shopping.
				</p>
			</div>
			<LoginForm />
			<p className="text-center text-muted-foreground text-sm">
				Don&apos;t have an account?{" "}
				<Link href="/register" className="underline hover:text-foreground">
					Create one
				</Link>
			</p>
		</main>
	);
}
