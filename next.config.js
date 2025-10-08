/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,

  // Allow external images (if you add artist/track images later)
  images: {
    domains: ["audiomack.com", "assets.audiomack.com"],
  },

  // Webpack configuration for server-side file reading
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow fs and path modules on server
      config.externals.push({
        fs: "commonjs fs",
        path: "commonjs path",
      });
    }
    return config;
  },

  // Environment variables available to client
  env: {
    NEXT_PUBLIC_APP_NAME: "Liberian Pulse",
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
