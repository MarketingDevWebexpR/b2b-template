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
};

export default nextConfig;
