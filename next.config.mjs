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
  // GitHub Pages serves content from a subdirectory when using project pages
  // If you're using a custom domain or user/organization page, you can remove this
  basePath: '/portfolio',
  // Disable server-based features since GitHub Pages is static
  trailingSlash: true,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;