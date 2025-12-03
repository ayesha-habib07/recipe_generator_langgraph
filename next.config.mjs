// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps safely for Turbopack
  productionBrowserSourceMaps: false,

  // Disable server source maps (Turbopack)
  experimental: {
    serverSourceMaps: false,
  },

  // Add an empty turbopack config to silence the error
  turbopack: {},
};

export default nextConfig;
