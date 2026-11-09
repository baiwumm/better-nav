import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// 受保护路由：匿名访问这些路径才该跳登录页，其余交回 Next 返回 404。
// 需与 src/lib/supabase/proxy.ts 里的 /admin 判断保持一致（该文件禁改）。
const PROTECTED_PATH_PREFIXES = ["/admin"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/* --------------------------------------------------
 * 安全响应头
 * 静态资源不经过 proxy（见下方 matcher），由 Vercel CDN 直接返回
 * -------------------------------------------------- */
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";
const supabaseWsOrigin = supabaseOrigin.replace(/^http/, "ws");

// 只放行实际用到的第三方脚本与请求目标：GA、Clarity、Vercel Analytics、Supabase
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.clarity.ms https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    supabaseOrigin,
    supabaseWsOrigin,
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://stats.g.doubleclick.net",
    "https://*.clarity.ms",
    "https://c.bing.com",
    "https://vitals.vercel-insights.com",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export default async function proxy(request: NextRequest) {
  let response = await updateSession(request);

  // updateSession 对「未登录 + 非 API + 非 /login」一律 307 到 /login，
  // 未知路径因此拿不到 404；只保留受保护路由的跳转。
  const location = response.headers.get("location");

  if (
    response.status === 307 &&
    location &&
    new URL(location, request.url).pathname === "/login" &&
    !isProtectedPath(request.nextUrl.pathname)
  ) {
    const next = NextResponse.next({ request });

    // 保留 getClaims() 写回的会话刷新 cookie
    response.cookies.getAll().forEach((cookie) => next.cookies.set(cookie));
    response = next;
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // 开发模式下 Next 需要 eval 与 HMR websocket，CSP 只在生产环境启用
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  }

  return response;
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
