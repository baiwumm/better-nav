/**
 * @description: 作者身份的单一来源。
 * 展示名固定为 GitHub 用户名（取自 package.json 的 git 地址 owner，不用真名）；
 * bio 与头像运行时从 GitHub 账户拉取并缓存一天，在 GitHub 上改资料，站上自动跟随。
 */
import pkg from "#/package.json";

// package.json 的作者与仓库信息。repository 是标准字段（本项目未用，宽松保留），
// git 是本项目的自定义字段；resolveJsonModule 的精确推断不含 repository，这里放宽断言
const pkgMeta = pkg as {
  repository?: { url?: string };
  git?: { url?: string };
  author: { name: string; url: string };
};

/**
 * GitHub 用户名：git 地址 owner 优先（github.com/baiwumm/better-nav → baiwumm），
 * 回退到 author.name。
 */
const GIT_URL = pkgMeta.repository?.url ?? pkgMeta.git?.url ?? "";

export const AUTHOR_HANDLE =
  GIT_URL.match(/github\.com[/:]([^/]+?)(?:\.git)?(?:\/|$)/)?.[1] ??
  pkgMeta.author.name;

/** 作者主页 */
export const AUTHOR_SITE_URL = pkgMeta.author.url;

export interface GithubAuthor {
  /** 展示名：GitHub 用户名 */
  name: string;
  /** GitHub bio，替代站点自己的角色配置；可为空 */
  bio: string | null;
  /** 头像地址 */
  avatarUrl: string;
}

/**
 * @description: 拉取 GitHub 账户的 bio 与头像（next fetch 缓存 revalidate 一天，多调用方共享同一缓存）。
 * 失败时回退：bio 置空、头像退化为 github 直链，两者都不依赖 api.github.com
 */
export async function getGithubAuthor(): Promise<GithubAuthor> {
  const fallback: GithubAuthor = {
    name: AUTHOR_HANDLE,
    bio: null,
    avatarUrl: `https://github.com/${AUTHOR_HANDLE}.png`,
  };

  try {
    const res = await fetch(`https://api.github.com/users/${AUTHOR_HANDLE}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return fallback;
    }

    const data = (await res.json()) as {
      bio?: string | null;
      avatar_url?: string | null;
    };

    return {
      name: AUTHOR_HANDLE,
      bio: data.bio ?? null,
      avatarUrl: data.avatar_url || fallback.avatarUrl,
    };
  } catch {
    return fallback;
  }
}
