import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
	return (
		<main className="mx-auto max-w-md space-y-6 px-4 py-12 sm:px-6 lg:px-8">
			<div className="space-y-2 text-center">
				<h1 className="font-semibold text-3xl tracking-tight">
					Create your account
				</h1>
				<p className="text-muted-foreground text-sm">
					Join us to save carts, track orders, and checkout faster.
				</p>
			</div>
			<RegisterForm />
			<p className="text-center text-muted-foreground text-sm">
				Already have an account?{" "}
				<Link href="/login" className="underline hover:text-foreground">
					Sign in
				</Link>
			</p>
		</main>
	);
}
