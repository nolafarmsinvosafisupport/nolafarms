// R2_PUBLIC_URL isn't known until the bucket + (optionally) its custom domain
// exist, so this reads it from the environment instead of hardcoding a host —
// once the env var is set in Railway and redeployed, uploaded product images
// are automatically allowed through next/image with no further code change.
function r2RemotePattern() {
  if (!process.env.R2_PUBLIC_URL) return null;
  try {
    const url = new URL(process.env.R2_PUBLIC_URL);
    return { protocol: url.protocol.replace(':', ''), hostname: url.hostname };
  } catch {
    return null;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
      ...(r2RemotePattern() ? [r2RemotePattern()] : []),
    ],
    // WebP only — AVIF takes 3-5x longer to encode on first request with no
    // meaningful quality benefit for farm photography at these file sizes.
    formats: ['image/webp'],
    // Cache optimised images for 1 year. Without this Next.js re-encodes every
    // 60 seconds, burning CPU on Railway and slowing first-load per image.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Only generate the breakpoints actually used by the site.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      {
        // The livestock category landing page was removed — the catalogue is now just
        // /products. A permanent redirect keeps any indexed or shared link working and
        // passes its search ranking to /products instead of dropping it on a 404.
        source: '/products/livestock',
        destination: '/products',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Long-term browser cache for public images (hashed by Next.js URL).
        source: '/_next/image',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Cache raw public-folder images for 1 year in the browser.
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Static JS/CSS chunks are content-hashed — safe to cache forever.
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
