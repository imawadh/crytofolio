/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Coin logos come from many CDNs (CoinGecko, Cloudinary, iStock, etc.)
    // so allow any HTTPS host. Optimization still applies.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
