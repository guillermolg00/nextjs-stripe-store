// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	reactCompiler: true,
	cacheComponents: true,
	experimental: {
		typedEnv: true,
		inlineCss: true,
	},
	images: {
		minimumCacheTTL: 31536000,
		remotePatterns: [
			{ hostname: "*.blob.vercel-storage.com" },
			{ hostname: "files.stripe.com" },
			{ hostname: "deifkwefumgah.cloudfront.net" },
			{ hostname: "media.istockphoto.com" },
		],
	},
};

export default nextConfig;
