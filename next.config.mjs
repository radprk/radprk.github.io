/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Make sure these settings are commented out or removed for username.github.io deployments
  // basePath: '/repository-name',
  // assetPrefix: '/repository-name/',
};

export default nextConfig;