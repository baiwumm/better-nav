import { createClient } from "@supabase/supabase-js";

/**
 * @description: 公开只读客户端（不读 cookies）。
 *
 * 走 getSupabaseServerClient 会触发 cookies()，页面因此被强制动态渲染，ISR 与整页缓存全部失效。
 * 首页、分类页、sitemap、llms.txt 这些「内容对所有访客一致」的路径都用这个客户端。
 * 读范围由 RLS 与 anon 列级授权限制，匿名访客拿到的数据与登录用户看到的公开数据一致。
 */
export function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，无法预渲染公开页",
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
