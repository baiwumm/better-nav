import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - _next (Next.js 内部文件)
     * - auth/callback (OAuth 回调由路由自己处理 code 与错误参数，不能被会话逻辑改写或重定向)
     * - 静态资源 (如 .css, .png)
     */
    "/((?!_next|auth/callback|[^?]*\\.(?:html?|css|js|json|xml|txt|md|png|jpg|jpeg|gif|webp|avif|ico|bmp|svg|tiff|tif|mp4|webm|ogg|mp3|wav|flac|aac|woff|woff2|eot|ttf|otf|webmanifest)$).*)",
  ],
};
