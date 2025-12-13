/** @type {import('next').NextConfig} */
const nextConfig = {
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
