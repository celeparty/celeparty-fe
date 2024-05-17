/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        URL_BASE: process.env.URL_BASE,
        URL_API: process.env.URL_API,
        URL_MEDIA: process.env.URL_MEDIA,
        KEY_API: process.env.KEY_API
    },
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
                hostname: "fastly.picsum.photos",
                pathname: "**",
            },
        ],
    }

}

module.exports = nextConfig
