import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface HeroProps {
	className?: string;
}

const Hero = ({ className }: HeroProps) => {
	return (
		<section className={cn("relative p-0 w-full", className)}>
			<div className="container mx-auto px-4 py-28 md:py-32">
				<div className="mx-auto flex max-w-5xl flex-col items-center">
					<div className="z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
						<div>
							<h1 className="mb-6 text-4xl font-bold tracking-tight text-pretty md:text-5xl lg:text-7xl">
								Nextjs Stripe Store
							</h1>
							<p className="mx-auto max-w-2xl text-muted-foreground md:text-lg lg:text-xl">
								Build your next e-commerce store with Nextjs and Stripe.
							</p>
						</div>

						<div className="mt-6 flex items-center gap-4">
							<Button asChild>
								<Link href="https://github.com/nextjs-stripe-store">
									<Github className="mr-2 h-4 w-4" />
									Github
								</Link>
							</Button>
						</div>
						<div className="mt-12 flex flex-col items-center gap-4 lg:mt-16">
							<p className="text-center text-sm text-muted-foreground">
								Powering the next generation of digital products
							</p>
							<div className="grid grid-cols-3 place-items-center items-center justify-center gap-6 opacity-80 sm:grid-cols-6 sm:gap-4">
								<Image
									src={ASSETS.logos.nextjs}
									alt="Next.js"
									width={100}
									height={20}
									className="h-5 w-auto dark:invert"
								/>
								<Image src={ASSETS.logos.stripe} alt="Stripe" width={80} height={32} className="h-8 w-auto" />
								<Image
									src={ASSETS.logos.vercel}
									alt="Vercel"
									width={100}
									height={20}
									className="h-5 w-auto dark:invert"
								/>
								<Image
									src={ASSETS.logos.shadcn}
									alt="ShadCN UI"
									width={120}
									height={24}
									className="h-6 w-auto dark:invert"
								/>
								<Image
									src={ASSETS.logos.tailwind.light}
									alt="Tailwind CSS"
									width={120}
									height={20}
									className="h-5 w-auto dark:hidden"
								/>
								<Image
									src={ASSETS.logos.tailwind.dark}
									alt="Tailwind CSS"
									width={120}
									height={20}
									className="hidden h-5 w-auto dark:block"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export { Hero };
