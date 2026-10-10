import type { NextConfig } from "next";

// Logo 等图片存放在 Supabase Storage，域名跟随环境变量派生，避免把项目 ID 硬编码进仓库
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: SUPABASE_URL ? [new URL(`${SUPABASE_URL}/**`)] : [],
    unoptimized: true, // 禁用 Vercel 图片优化
  },
};

export default nextConfig;
