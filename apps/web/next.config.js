/** @type {import('next').NextConfig} */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@knitwise/ui', '@knitwise/core', '@knitwise/storage'],
}

module.exports = nextConfig
