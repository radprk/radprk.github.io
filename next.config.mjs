/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // If you're hosting at username.github.io/repository-name
  // Include your repository name in basePath
  // If you're hosting at username.github.io, leave this empty
  basePath: '',
  // This helps with GitHub Pages static hosting
  trailingSlash: true,
};

export default nextConfig;