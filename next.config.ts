import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Turbopack the correct workspace root (this project folder)
  turbopack: { root: __dirname },
  // Additional Next.js config can be added here
};

export default nextConfig;
