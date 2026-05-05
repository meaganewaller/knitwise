/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@knitwise/ui', '@knitwise/core', '@knitwise/storage'],
}

module.exports = nextConfig
