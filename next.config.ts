import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off. Pages that read the database are rendered on each
  // visit, so saved changes show immediately. If you add caching later, every
  // admin save must also clear the affected pages.
  experimental: {
    // Room for one picture upload (4 MB) plus form data. The default is 1 MB.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
