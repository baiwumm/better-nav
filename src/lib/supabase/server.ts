import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll 在 Server Component 中调用时会抛错（仅 Server Action / Route Handler 可写 cookie），
            // 此处静默忽略即可，cookie 会在客户端 auth 刷新时自动设置。
          }
        },
      },
    },
  );
}

/**
 * @description: 校验登录用户（会请求 Supabase Auth 验签，确认 JWT 有效）。
 * 注册入口已在 Supabase 关闭，账号仅能由管理员在 Dashboard 中添加，
 * 因此「已登录」即代表受信任，后台写操作直接复用本校验。
 */
export async function requireUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
