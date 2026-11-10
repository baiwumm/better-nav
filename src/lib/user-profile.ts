/**
 * @Description: 用户菜单的展示名与头像地址（纯函数，便于单测）
 */
import type { User } from "@supabase/supabase-js";

/** 远程头像全部不可达时的本地兜底（public/avatar.png，与 OG 图共用同一文件） */
const FALLBACK_AVATAR = "/avatar.png";

/**
 * @description: 头像候选地址，按优先级排列：GitHub 身份头像 > 登录资料头像 > 本地兜底。
 * `user_metadata` 会被上次登录的 provider 整体覆盖（Google 登录后头像地址变成
 * lh3.googleusercontent.com，该域名国内不可达），GitHub 身份头像跨登录稳定且国内可达，
 * 因此置顶；远程全部失败时降级到本地文件，保证头像始终有图可显
 */
export function getAvatarCandidates(user: User | null): string[] {
  const githubAvatar = user?.identities?.find(
    (identity) => identity.provider === "github",
  )?.identity_data?.avatar_url;
  const metaAvatar = user?.user_metadata?.avatar_url;

  return [...new Set([githubAvatar, metaAvatar, FALLBACK_AVATAR])].filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );
}

/**
 * @description: 用户菜单展示名：GitHub 用户名优先（不展示真名），
 * 依次回退登录资料名、邮箱首字符
 */
export function getUserDisplayName(user: User | null): string {
  return (
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.name ||
    user?.email?.slice(0, 1) ||
    ""
  );
}
