import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/otp/:path*',
        destination: 'http://127.0.0.1:8000/otp/:path*',
      },
      {
        source: '/profile/:path*',
        destination: 'http://127.0.0.1:8000/profile/:path*',
      },
      {
        source: '/logout/:path*',
        destination: 'http://127.0.0.1:8000/logout/:path*',
      },
      {
        source: '/refresh/:path*',
        destination: 'http://127.0.0.1:8000/refresh/:path*',
      },
      {
        source: '/generate/:path*',
        destination: 'http://127.0.0.1:8000/generate/:path*',
      },
      {
        source: '/activities/:path*',
        destination: 'http://127.0.0.1:8000/activities/:path*',
      },
      {
        source: '/metrics/:path*',
        destination: 'http://127.0.0.1:8000/metrics/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
