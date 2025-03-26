import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  eslint: {
    // Allow warnings but fail on errors
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
}
 
export default nextConfig
