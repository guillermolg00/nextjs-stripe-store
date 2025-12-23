import { headers } from "next/headers";
import { authClient } from "@//lib/auth-client";
import { Button } from "../ui/button";

export const NavUser = async () => {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
			cache: "force-cache",
		},
	});

	if (session?.data) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm">Hello, {session.data.user.name}</span>
			</div>
		);
	}

	return <Button size={"sm"}>Sign in</Button>;
};

export const NavUserFallback = () => {
	return (
		<div
			className="h-6 w-28 animate-pulse rounded-sm bg-muted"
			aria-description="Loading user menu"
		/>
	);
};
