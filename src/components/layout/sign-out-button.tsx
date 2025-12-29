"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export function SignOutButton() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleSignOut = () => {
		startTransition(async () => {
			await authClient.signOut();
			router.push("/");
			router.refresh();
		});
	};

	return (
		<DropdownMenuItem
			onClick={handleSignOut}
			disabled={isPending}
			className="cursor-pointer"
		>
			<LogOut className="mr-2 h-4 w-4" />
			{isPending ? "Signing out..." : "Sign out"}
		</DropdownMenuItem>
	);
}
