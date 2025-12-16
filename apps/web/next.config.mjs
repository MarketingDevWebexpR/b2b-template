/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile workspace packages to ensure they work correctly in the build
  transpilePackages: ['@bijoux/types', '@bijoux/utils', '@bijoux/config-tailwind'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sage-portal.webexpr.dev',
        port: '',
        pathname: '/api/sage/articles/**',
      },
    ],
  },
  // Redirects: Collections merged into Categories
  async redirects() {
    return [
      {
        source: '/collections',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/collections/:slug',
        destination: '/categories/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
