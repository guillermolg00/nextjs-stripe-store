import { Package } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";

export const NavUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user) {
		const user = session.user;
		const initials = user.name
			? user.name
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2)
			: "U";

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="gap-2">
						<Avatar className="h-6 w-6">
							<AvatarImage src={user.image ?? undefined} alt={user.name} />
							<AvatarFallback className="text-xs">{initials}</AvatarFallback>
						</Avatar>
						<span className="hidden text-sm sm:inline">{user.name}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="font-medium text-sm">{user.name}</p>
							<p className="truncate text-muted-foreground text-xs">
								{user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href="/orders" className="cursor-pointer">
							<Package className="mr-2 h-4 w-4" />
							My Orders
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<SignOutButton />
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<Button asChild size="sm">
			<Link href="/login">Sign in</Link>
		</Button>
	);
};

export const NavUserFallback = () => {
	return (
		<div
			className="h-6 w-28 animate-pulse rounded-sm bg-muted"
			aria-description="Loading user menu"
		/>
	);
};
