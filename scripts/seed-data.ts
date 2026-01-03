import type { VariantOption } from "@/db/schema";

type SeedVariant = {
	price: string;
	currency: string;
	images: string[];
	options: VariantOption[];
};

type SeedProduct = {
	name: string;
	description: string;
	summary: string;
	images: string[];
	collectionSlugs: string[];
	variants: SeedVariant[];
};

type SeedCollection = {
	name: string;
	slug: string;
	description?: string;
	image?: string;
};

export const collections: SeedCollection[] = [
	{
		name: "Organizers",
		slug: "organizers",
		description: "Tech organizers and pouches for everyday carry",
	},
	{
		name: "Cables",
		slug: "cables",
		description: "Premium cables and charging solutions",
	},
	{
		name: "Accessories",
		slug: "accessories",
		description: "Tech accessories for your devices",
	},
	{
		name: "iPad Sleeves",
		slug: "ipad-sleeves",
		description: "Premium protection for your iPad",
	},
	{
		name: "Hubs & Adapters",
		slug: "hubs-adapters",
		description: "USB-C hubs and connectivity solutions",
	},
	{
		name: "AirPods Cases",
		slug: "airpods-cases",
		description: "Premium leather cases for AirPods",
	},
	{
		name: "Chargers",
		slug: "chargers",
		description: "Wireless chargers and docks",
	},
];

export const products: SeedProduct[] = [
	{
		name: "STOW ORGANIZER",
		summary:
			"Thoughtful storage for all your essentials, from chargers to SD cards.",
		description: `Thoughtful storage for all your essentials, from chargers to SD cards. Housed in a minimal form with considered details for a refined everyday carry solution.

This collection was something completely unexplored for us. Embracing an increasingly digital and travel-heavy lifestyle, we ourselves desperately needed a way to better organize our daily tech essentials. A basic, flimsy pouch was no longer cutting it. So, we created our own. Luxe materials & craftsmanship. Pockets, loops, compartments – small details that push us to stay organized and ultimately, show up as better versions of ourselves every day. Because we all need a boost sometimes.

• Sorted & tangle-free on-the-go
• Crafted with a resistant textile exterior & soft quilted interior
• Refined genuine leather accents
• Elastic loops, flexible pockets & an exterior pocket for even quicker access
• Water-repellent zipper & coated canvas finish for extra care
• Clever hidden storage in the zippered compartment`,
		images: [
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_1.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_2.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_3.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_4.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_5.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_6.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_7.jpg",
		],
		collectionSlugs: ["organizers"],
		variants: [
			{
				price: "4999",
				currency: "USD",
				images: [
					"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_1.jpg",
				],
				options: [
					{
						key: "color",
						label: "Color",
						value: "Sage",
						type: "color",
						colorValue: "#9CAF88",
					},
				],
			},
			{
				price: "4999",
				currency: "USD",
				images: [
					"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_slate_1.jpg",
				],
				options: [
					{
						key: "color",
						label: "Color",
						value: "Slate",
						type: "color",
						colorValue: "#404040",
					},
				],
			},
			{
				price: "4999",
				currency: "USD",
				images: [
					"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_organizer_indigo_1.jpg",
				],
				options: [
					{
						key: "color",
						label: "Color",
						value: "Indigo",
						type: "color",
						colorValue: "#2D3E4A",
					},
				],
			},
		],
	},
	{
		name: "STOW SLIM FOR IPAD",
		summary: "The premium iPad sleeve with easy-access magnetic closure.",
		description: `A refined solution for your entire remote working setup in a slim form, finished with considered detail for seamless carry.

For something as mobile and heavily used as our iPads, we wanted a protection solution that could deliver reliable and superior function, but still looked just as refined as a bag we'd carry normally. The end result: catered to the on-the-go lifestyle with an effortless magnetic closure and seamless fit for your entire remote working setup, housed in a thoughtfully finished design inspired by premium leather craftsmanship.

• Everyday protection in slim, refined form
• Crafted with a resistant coated textile exterior & soft quilted interior
• Easy access magnetic closure for seamless access
• Fits your iPad, with or without your Smart Keyboard Folio
• Also available for: iPad (7th & 8th Gen) / iPad Air (4th Gen) / iPad Pro (11")`,
		images: [
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_slim_for_ipad_1.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_slim_for_ipad_2.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_slim_for_ipad_3.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_slim_for_ipad_4.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_slim_for_ipad_5.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/stow_slim_for_ipad_6.jpg",
		],
		collectionSlugs: ["ipad-sleeves", "accessories"],
		variants: [
			{
				price: "5999",
				currency: "USD",
				images: [],
				options: [],
			},
		],
	},
	{
		name: "USB-C SMART HUB",
		summary: "The 7-in-1 USB-C adapter for maximum productivity.",
		description: `Maximize productivity from anywhere. This 7-in-1 hub fits a complete mobile workstation, from just a single port – powerful performance with a design to match.

We've always believed that the future is digital. As more of us transition to the modern lifestyle, we saw a gap in tools that can help maximize performance, no matter if we're at the office or on-the-go with just a laptop. We created our USB-C hub with the desire to give our community the flexibility to work from anywhere, without having to choose between powerful functionality or refined design.

• Do more on your Type-C laptop
• Power Delivery USB-C, HDMI, SD, Micro-SD, Ethernet & 2 USB-A ports
• Crafted with a weighted aluminum base & sleek textured silicone
• Pocket-sized for effortless on-the-go carry
• Immersive 4K@30Hz video via HDMI
• Instantly sync & transfer files with USB 3.0 SuperSpeed
• Effortless multi-tasking with 48W PD pass-through charging`,
		images: [
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/smart_hub_1.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/smart_hub_2.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/smart_hub_3.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/smart_hub_4.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/smart_hub_5.jpg",
		],
		collectionSlugs: ["hubs-adapters", "accessories"],
		variants: [
			{
				price: "7999",
				currency: "USD",
				images: [],
				options: [],
			},
		],
	},
	{
		name: "LEATHER CASE FOR AIRPODS PRO",
		summary: "The fully-wrapped leather AirPods Pro case.",
		description: `Timeless carry. From forming its shape, sewing each side, and finally painting the edges, our genuine leather cases are handcrafted with care making no two completely alike.

We wanted to design something special to house a device that brings us so much joy in our day-to-day lives. As with our entire range of protection, the focus was on how we could add a bit more personality to our everyday carry. Beautiful leather in a timeless finish. Sleek and thin, but still reliably protective. A classic design that'll only get better over time, like a great song.

• Crafted with consciously sourced genuine Italian leather
• Designed to age beautifully with a patina uniquely yours
• Handcrafted with care to be completely unique
• Sleek & thin, yet reliably protective
• Hassle-free access to AirPods Pro, charging port & controls
• Compatible with wireless charging
• Also available for AirPods (Gen 1 & 2)`,
		images: [
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/leather_case_for_airpods_1.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/leather_case_for_airpods_2.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/leather_case_for_airpods_3.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/leather_case_for_airpods_4.jpg",
		],
		collectionSlugs: ["airpods-cases", "accessories"],
		variants: [
			{
				price: "3999",
				currency: "USD",
				images: [],
				options: [],
			},
		],
	},
	{
		name: "DOCK WIRELESS CHARGER",
		summary: "The wireless charging dock with full device access.",
		description: `A thoughtful balance of form and function. Enjoy full access to your device even while charging with built-in dual coils in a sleek form designed to curate the feel of any environment.

This is our solution for the countless people who use their phones as an alarm clock, those who like to stream while charging, or just want to maintain full functionality even while charging on their desk. Multi-functional: a charger, phone stand, and design statement in one.

• Powers iPhones up to 7.5W & other Qi compatible devices up to 10W
• Enjoy full access to your device in both portrait & landscape modes
• Built to last with hard-wearing textile & precision-engineered steel
• Foreign object detection & thermal protection ensures safe charging
• Hassle-free charging through cases up to 3mm
• Comes with a 6.5ft USB-A to USB-C cable`,
		images: [
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/dock_wireless_charger_1.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/dock_wireless_charger_2.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/dock_wireless_charger_3.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/dock_wireless_charger_4.jpg",
		],
		collectionSlugs: ["chargers", "accessories"],
		variants: [
			{
				price: "6999",
				currency: "USD",
				images: [],
				options: [
					{
						key: "color",
						label: "Color",
						value: "Rosa",
						type: "color",
						colorValue: "#E4CBCC",
					},
				],
			},
			{
				price: "6999",
				currency: "USD",
				images: [],
				options: [
					{
						key: "color",
						label: "Color",
						value: "Slate",
						type: "color",
						colorValue: "#404040",
					},
				],
			},
		],
	},
	{
		name: "BELT WATCH",
		summary: "The 4-foot charging cable for Apple Watch.",
		description: `A charging solution for your Apple Watch, designed with considered details to make everyday life with your device more seamless.

We design to improve our daily interaction with our tech essentials. For devices and accessories we now spend so much time with, it just doesn't make much sense to stick with options that only breed frustration. Belt Watch was crafted with exactly this in mind: a non-slip silicone grip, a weighted aluminium base, and our signature genuine leather belt all lend to a solution that look and feels like quality.

• Magnetic connector snaps into place
• Non-slip silicone pad keeps your device in place
• Stay tangle-free with the genuine leather strap
• 4ft length for effortless on-the-go carry
• Reinforced nylon braiding withstands wear & tear
• Choose quality – Apple MFi certified`,
		images: [
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/belt_watch_1.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/belt_watch_2.jpg",
			"https://mltbqy256fvxokxq.public.blob.vercel-storage.com/products/belt_watch_3.jpg",
		],
		collectionSlugs: ["cables", "accessories"],
		variants: [
			{
				price: "1999",
				currency: "USD",
				images: [],
				options: [],
			},
		],
	},
];
