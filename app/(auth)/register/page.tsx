import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
	return (
		<main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
				<p className="text-muted-foreground text-sm">
					Join us to save carts, track orders, and checkout faster.
				</p>
			</div>
			<RegisterForm />
			<p className="text-sm text-muted-foreground text-center">
				Already have an account?{" "}
				<Link href="/login" className="underline hover:text-foreground">
					Sign in
				</Link>
			</p>
		</main>
	);
}
