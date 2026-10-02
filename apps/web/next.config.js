/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@stillalive/shared-types'],
};

module.exports = nextConfig;
