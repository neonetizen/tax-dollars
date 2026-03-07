import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/data/:path*",
        destination: "https://seshat.datasd.org/:path*",
      },
    ];
  },
};

export default nextConfig;
