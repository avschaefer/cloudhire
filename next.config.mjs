/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize for Cloudflare Pages
  output: 'export',
  trailingSlash: true,
  // Reduce bundle size
  experimental: {
    optimizeCss: true,
  },
  // Webpack optimizations for smaller bundles
  webpack: (config, { isServer }) => {
    // Reduce bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000, // ~240KB chunks
          },
        },
      },
    }

    // Don't include large files in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    return config
  },
}

export default nextConfig
