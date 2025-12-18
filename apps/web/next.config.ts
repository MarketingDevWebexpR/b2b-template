import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Compiler for automatic memoization
  // This eliminates the need for manual useMemo/useCallback
  reactCompiler: true,

  // Enable Turbopack as the default bundler for development
  turbopack: {},

  // Transpile workspace packages to ensure they work correctly in the build
  transpilePackages: ['@bijoux/types', '@bijoux/utils', '@bijoux/config-tailwind'],

  images: {
    // Allow private IP addresses in development (MinIO on localhost)
    dangerouslyAllowSVG: true,
    // Configure allowed quality values for image optimization
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // MinIO/S3 local development server
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9002',
        pathname: '/**',
        search: '',
      },
      // MinIO/S3 alternative localhost
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9002',
        pathname: '/**',
        search: '',
      },
      // Production S3/MinIO (adjust hostname as needed)
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Use unoptimized images in development to avoid private IP restrictions
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Redirects: Canonical category URLs
  async redirects() {
    return [
      // Collections -> Categorie (legacy routes)
      {
        source: '/collections',
        destination: '/categorie',
        permanent: true,
      },
      {
        source: '/collections/:path*',
        destination: '/categorie/:path*',
        permanent: true,
      },
      // Categories (plural) -> Categorie (singular, canonical)
      {
        source: '/categories',
        destination: '/categorie',
        permanent: true,
      },
      {
        source: '/categories/:path*',
        destination: '/categorie/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
