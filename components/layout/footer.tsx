"use client";

import { Facebook, Instagram, type LucideIcon, Plus, Twitter } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type NewsletterData = {
	title?: string;
	description?: string;
};

type InfoItem = {
	text: string;
	title: string;
	link?: string;
	icon: LucideIcon;
};

type FooterLink = {
	text: string;
	link?: string;
};

type SocialLink = {
	link: string;
	icon: LucideIcon;
};

type FooterLinksSection = {
	title: string;
	id: string;
	items: FooterLink[];
};

type FooterDetailsType = {
	image: {
		src: string;
		alt: string;
	};
	homeLink: {
		logo: {
			light: string;
			dark: string;
		};
		link: string;
	};
	title: string;
	description: string;
};

interface FooterProps {
	newsletter?: NewsletterData;
	infoSectionList?: InfoItem[];
	footerLinks?: FooterLinksSection[];
	footerDetails?: FooterDetailsType;
	paymentMethods?: string[];
	socialLinks?: SocialLink[];
	submenuLinks?: {
		text: string;
		link: string;
	}[];
	className?: string;
}

interface FooterLinksSectionProps {
	sections: FooterLinksSection[];
}

interface SocialMediaSectionProps {
	links: SocialLink[];
}

const FOOTER_LINKS: FooterLinksSection[] = [
	{
		title: "Shop",
		id: "shop",
		items: [
			{
				text: "New Launches",
				link: "#",
			},
			{
				text: "Best Sellers",
				link: "#",
			},
			{
				text: "Skin Type Routines",
				link: "#",
			},
			{
				text: "Gifts & Sets",
				link: "#",
			},
		],
	},
	{
		title: "Support",
		id: "support",
		items: [
			{
				text: "Contact Us",
				link: "#",
			},
			{
				text: "FAQs",
				link: "#",
			},
			{
				text: "Order Tracking",
				link: "#",
			},
			{
				text: "Returns & Exchanges",
				link: "#",
			},
		],
	},
	{
		title: "About",
		id: "about",
		items: [
			{
				text: "Our Story",
				link: "#",
			},
			{
				text: "Ingredients",
				link: "#",
			},
			{
				text: "Sustainability",
				link: "#",
			},
			{
				text: "Press",
				link: "#",
			},
		],
	},
];

const FOOTER_DETAILS = {
	image: {
		src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/promotional/Luxurious-Cosmetic-Display-2.png",
		alt: "",
	},
	homeLink: {
		logo: {
			light: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
			dark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark-white.svg",
		},
		link: "#",
	},
	title: "Next.js + Stripe E-commerce Template",
	description:
		"A production-ready e-commerce starter built with Next.js 16, Stripe, and Tailwind CSS. Launch your online store in minutes with automatic tax, multi-currency support, and seamless checkout.",
};

const PAYMENT_METHODS = [
	"https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/amazonpay.svg",
	"https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/applepay.svg",
	"https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/mastercard.svg",
	"https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/paypal.svg",
	"https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/visa.svg",
	"https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/discover.svg",
];

const SOCIAL_MEDIA_LINKS: SocialLink[] = [
	{
		icon: Facebook,
		link: "#",
	},
	{
		icon: Twitter,
		link: "#",
	},
	{
		icon: Instagram,
		link: "#",
	},
];

const SUBMENU = [
	{
		text: "Shipping Policy",
		link: "#",
	},
	{
		text: "Returns Policy",
		link: "#",
	},
	{
		text: "Terms Of Service",
		link: "#",
	},
	{
		text: "Privacy Policy",
		link: "#",
	},
];

const Footer = ({
	footerLinks = FOOTER_LINKS,
	footerDetails = FOOTER_DETAILS,
	paymentMethods = PAYMENT_METHODS,
	socialLinks = SOCIAL_MEDIA_LINKS,
	submenuLinks = SUBMENU,
	className,
}: FooterProps) => {
	return (
		<section className={cn("pt-12.5 pb-30", className)}>
			<div className="container mx-auto px-4 space-y-10">
				<div className="grid grid-cols-1 gap-7.5 lg:grid-cols-5 xl:grid-cols-2">
					<div className="space-y-5 lg:max-xl:col-span-2">
						<Link href="/" className="text-xl font-bold">
							Next Stripe Store
						</Link>
						<p className="max-w-100 text-sm leading-relaxed text-muted-foreground">
							{footerDetails.description}
						</p>
					</div>
					<div className="lg:max-xl:col-span-3">
						<FooterLinksSection sections={footerLinks} />
					</div>
				</div>
				<div className="flex flex-wrap justify-between gap-6">
					<div className="space-y-5">
						<Select defaultValue="english">
							<SelectTrigger className="w-28">
								<SelectValue placeholder="Select a Language..." />
							</SelectTrigger>
							<SelectContent align="start">
								<SelectGroup>
									<SelectItem value="english">English</SelectItem>
									<SelectItem value="français">Français</SelectItem>
									<SelectItem value="arabic">Arabic</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<PaymentMethods cards={paymentMethods} />
					</div>
					<div>
						<SocialMediaSection links={socialLinks} />
					</div>
				</div>
				<div className="flex flex-wrap justify-between gap-6">
					<p className="text-sm">© 2026</p>
					<FooterSubMenu links={submenuLinks} />
				</div>
			</div>
		</section>
	);
};

const FooterLinksSection = ({ sections }: FooterLinksSectionProps) => {
	if (!sections) return null;

	const allAccordionIds = sections.map(({ id }) => id);

	return (
		<Accordion
			defaultValue={allAccordionIds}
			type="multiple"
			className="grid grid-cols-1 lg:grid-cols-3 gap-4"
		>
			<AccordionItems sections={sections} />
		</Accordion>
	);
};

const AccordionItems = ({ sections }: { sections: FooterLinksSection[] }) => {
	return (
		<Fragment>
			{sections.map(({ id, title, items }) => (
				<AccordionItem key={id} value={id} className="border-b lg:border-transparent">
					<AccordionTrigger className="cursor-auto rounded-none pt-0 pb-4 text-base leading-normal font-bold hover:no-underline max-lg:py-4 [&>svg]:hidden">
						{title}
						<div className="lg:hidden">
							<Plus className="size-5" />
						</div>
					</AccordionTrigger>
					<AccordionContent className="pb-1 max-lg:py-4">
						<ul className="space-y-4 lg:space-y-3">
							{items.map(({ link, text }, index) => (
								<li className="text-sm leading-tight font-light" key={`item-${index}`}>
									<a href={link} className="hover:underline hover:underline-offset-3">
										{text}
									</a>
								</li>
							))}
						</ul>
					</AccordionContent>
				</AccordionItem>
			))}
		</Fragment>
	);
};

const PaymentMethods = ({ cards }: { cards: string[] }) => {
	return (
		<ul className="flex flex-wrap items-center gap-3">
			{cards.map((card, index) => (
				<li key={`card-${index}`}>
					<img className="w-9.5" src={card} alt="card" />
				</li>
			))}
		</ul>
	);
};

const SocialMediaSection = ({ links }: SocialMediaSectionProps) => {
	return (
		<ul className="flex flex-wrap gap-4">
			{links.map(({ icon: Icon, link }, index) => (
				<li key={`social-${index}`}>
					<Button size="icon-lg" asChild className="rounded-full">
						<a href={link}>
							<Icon className="size-4.5" />
						</a>
					</Button>
				</li>
			))}
		</ul>
	);
};

const FooterSubMenu = ({ links }: { links: FooterLink[] }) => {
	return (
		<ul className="flex flex-wrap gap-x-6 gap-y-4">
			{links.map(({ link, text }, index) => (
				<li key={`submenu-${index}`}>
					<a href={link} className="text-sm font-light">
						{text}
					</a>
				</li>
			))}
		</ul>
	);
};

export { Footer };
