/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		URL_BASE: process.env.URL_BASE,
		URL_API: process.env.URL_API,
		BASE_API: process.env.BASE_API,
		URL_MEDIA: process.env.URL_MEDIA,
		KEY_API: process.env.KEY_API,
		BASE_API_REGION: process.env.BASE_API_REGION,
		KEY_REGION: process.env.KEY_REGION,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		JWT_SECRET: process.env.JWT_SECRET,
	},
	output: 'standalone',
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "celeparty.sgp1.digitaloceanspaces.com",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "sub.typestaging.my.id",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "https://papi.celeparty.com",
				pathname: "**",
			},
			{
				protocol: "http",
				hostname: "localhost",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "fastly.picsum.photos",
				pathname: "**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
};

module.exports = nextConfig;
