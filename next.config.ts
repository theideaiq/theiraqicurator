import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // The staff room moved from /admin to /staff; keep old links and bookmarks working.
  async redirects() {
    return [
      { source: '/admin', destination: '/staff', permanent: true },
      { source: '/admin/:path*', destination: '/staff/:path*', permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default withNextIntl(nextConfig);
