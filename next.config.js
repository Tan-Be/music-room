/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  eslint: {
    dirs: ['src'],
  },
}

module.exports = nextConfig
