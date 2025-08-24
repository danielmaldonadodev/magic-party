// next.config.mjs
const SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cards.scryfall.io' },
      { protocol: 'https', hostname: 'img.scryfall.com' },
      { protocol: 'https', hostname: 'api.scryfall.com' }, // Agregar esta línea
      { protocol: 'https', hostname: SUPABASE_HOST, pathname: '/storage/v1/object/**' }
    ]
  }
}

export default nextConfig