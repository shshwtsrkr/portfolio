import type { NextConfig } from 'next'

// Force the canonical domain: requests to any *.vercel.app URL are 308-redirected to CANONICAL_HOST, same
// path. Declared here rather than in proxy.ts so Vercel applies it at the edge without running a function.
// Read at build time; inert until CANONICAL_HOST is set, so local dev is unaffected.
const canonicalHost = process.env.CANONICAL_HOST

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    if (!canonicalHost) return []
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: '(?<deployment>.*)\\.vercel\\.app' }],
      destination: `https://${canonicalHost}/:path*`,
      permanent: true,
    }]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
  },
}

export default nextConfig
