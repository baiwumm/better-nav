import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [new URL("https://athbiwlqrieaoetfapxd.supabase.co/**")],
    unoptimized: true, // 禁用 Vercel 图片优化
  },
};

export default nextConfig;
