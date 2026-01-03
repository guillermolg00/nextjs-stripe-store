import { Award, Hammer, Leaf, type LucideIcon } from "lucide-react";

type Feature = {
	title: string;
	description: string;
	icon?: LucideIcon;
};

type ProductFeaturesProps = {
	features?: Feature[];
};

const defaultFeatures: Feature[] = [
	{
		title: "Sustainable Materials",
		description:
			"Crafted from responsibly sourced materials with minimal environmental impact.",
	},
	{
		title: "Expert Craftsmanship",
		description:
			"Each piece is carefully made by skilled artisans with attention to detail.",
	},
	{
		title: "Quality Guaranteed",
		description:
			"Built to last with premium components and rigorous quality standards.",
	},
];

const defaultIcons = [Leaf, Hammer, Award];

export function ProductFeatures({
	features = defaultFeatures,
}: ProductFeaturesProps) {
	return (
		<section className="mt-20 border-border border-t pt-16">
			<h2 className="mb-12 text-center font-medium text-3xl tracking-tight">
				Crafted with intention
			</h2>
			<div className="grid gap-8 md:grid-cols-3">
				{features.map((feature, index) => {
					const Icon =
						feature.icon ?? defaultIcons[index % defaultIcons.length];
					if (!Icon) return null;
					return (
						<div
							key={feature.title}
							className="group flex flex-col items-center text-center"
						>
							<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-foreground">
								<Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary-foreground" />
							</div>
							<h3 className="mb-2 font-medium text-lg">{feature.title}</h3>
							<p className="text-muted-foreground text-sm">
								{feature.description}
							</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}
