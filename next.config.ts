import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces the minimal Node.js bundle used by the Docker runtime image.
  output: "standalone",
};

export default nextConfig;
