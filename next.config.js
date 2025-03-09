/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'bufferutil', 'utf-8-validate'];
    return config;
  },
};

module.exports = nextConfig;
