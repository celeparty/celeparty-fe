/** @type {import('next').NextConfig} */
const path = require('path');

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
		PRODUCTION_MODE: process.env.PRODUCTION_MODE,
	},
	output: "standalone",
	reactStrictMode: true,
	swcMinify: false,
	webpack: (config) => {
		config.resolve.alias['@'] = path.resolve(__dirname);
		return config;
	},
	images: {
		unoptimized: true,
  		loader: "default",
 	 	domains: ["celeparty.com", "www.celeparty.com", "localhost"],
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
				hostname: "papi.celeparty.com",
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
			{
				protocol: "https",
				hostname: "celeparty.com",
				pathname: "/uploads/**",
			},
		],
	},
// 	async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           {
//             key: 'Content-Security-Policy',
//             value: `
//               default-src 'self';
//               script-src
//                 'self'
//                 'unsafe-inline'
//                 'unsafe-eval'
//                 blob:
//                 https://app.sandbox.midtrans.com
//                 https://snap-assets.al-pc-id-b.cdn.gtflabs.io
//                 https://api.sandbox.midtrans.com
//                 https://pay.google.com
//                 https://js-agent.newrelic.com
//                 https://bam.nr-data.net
//                 https://gwk.gopayapi.com;
//               frame-src
//                 'self'
//                 https://app.sandbox.midtrans.com
//                 https://snap.midtrans.com;
//               connect-src
//                 'self'
//                 https://api.sandbox.midtrans.com
//                 https://bam.nr-data.net;
//             `.replace(/\s{2,}/g, ' ').trim(),
//           },
//         ],
//       },
//     ];
//   },
};

module.exports = nextConfig;
