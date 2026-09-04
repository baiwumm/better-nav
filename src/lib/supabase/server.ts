import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          }
          catch {
            // setAll 在 Server Component 中调用时会抛错（仅 Server Action / Route Handler 可写 cookie），
            // 此处静默忽略即可，cookie 会在客户端 auth 刷新时自动设置。
          }
        },
      },
    },
  )
}

/**
 * @description: 校验管理员：登录 + 邮箱白名单（ADMIN_EMAILS，逗号分隔），
 * 不满足任一条件返回 null（后台写操作接口鉴权用）
 */
export async function requireAdmin() {
  const user = await requireUser()
  if (!user?.email) {
    return null
  }
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  if (!adminEmails.includes(user.email.toLowerCase())) {
    return null
  }
  return user
}

/**
 * @description: 校验登录用户（会请求 Supabase Auth 验签，确认 JWT 有效）
 */
export async function requireUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
