/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "download.lenovo.com",
        pathname: "/**",
      },
      {
        // Supabase Storage — every photo uploaded through the admin (media
        // library, product form, catalog importer) is served from here.
        // Wildcarded to the project ref rather than hardcoding
        // dkbcvbzgcxtuhqhnipky.supabase.co so this doesn't silently break
        // again if the Supabase project ever changes.
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;