// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	reactCompiler: true,
	cacheComponents: true,
	experimental: {
		typedEnv: true,
	},
	images: {
		remotePatterns: [
			{ hostname: "*.blob.vercel-storage.com" },
			{ hostname: "files.stripe.com" },
			{ hostname: "deifkwefumgah.cloudfront.net" },
			{ hostname: "media.istockphoto.com" },
		],
	},
};

export default nextConfig;
