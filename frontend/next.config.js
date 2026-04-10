/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.cloudflare.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  // Static export for Hostinger deployment (served by Express)
  output: 'export',
  // SEO: trailing slashes for consistent URLs
  trailingSlash: false,
  // Compression
  compress: true,
};

module.exports = nextConfig;
