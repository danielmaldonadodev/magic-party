// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cards.scryfall.io' },
      { protocol: 'https', hostname: 'img.scryfall.com' },
      { protocol: 'https', hostname: 'api.scryfall.com' },
    ],
  },
};

module.exports = nextConfig;
