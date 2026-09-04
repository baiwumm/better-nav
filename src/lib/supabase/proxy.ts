import type { NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { RESPONSE, responseMessage } from "@/lib/utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const path = request.nextUrl.pathname;
  const isApiRoute = path.startsWith("/api");
  const isWriteApiRoute =
    isApiRoute && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  // 首页直接放行
  if (path === "/") {
    return supabaseResponse;
  }

  // OG 图片路由直接放行（无扩展名，会被 matcher 拦截导致分享时拿不到图）
  if (path === "/opengraph-image") {
    return supabaseResponse;
  }

  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");

  // ✅ 只要有 code，立刻清理并跳首页
  if (code) {
    url.searchParams.delete("code");

    return NextResponse.rewrite(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  const claims = data?.claims;

  // 管理员白名单（与 requireAdmin 保持一致：ADMIN_EMAILS 逗号分隔、大小写不敏感）
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email =
    typeof claims?.email === "string" ? claims.email.toLowerCase() : "";
  const isAdmin = !!(email && adminEmails.includes(email));

  // 已登录访问登录页：一律回首页（避免 claims 快照与 getUser 最新邮箱不一致时 /admin ↔ /login 302 循环）
  if (claims && path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 未登录或非白名单邮箱访问管理页面，一律跳登录页
  if ((!claims || !isAdmin) && path.startsWith("/admin")) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";

    return NextResponse.redirect(url);
  }

  // 写 API：未登录或非白名单一律 401（路由内 requireAdmin 二次验签兜底）
  if ((!claims || !isAdmin) && isWriteApiRoute) {
    return NextResponse.json(
      responseMessage(null, "未登录或无权限", RESPONSE.ERROR),
      { status: 401 },
    );
  }

  if (!claims && !isApiRoute && !path.startsWith("/login")) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
