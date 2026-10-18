import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "vteamfit-oct-26.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "vteamfitnessapp.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
