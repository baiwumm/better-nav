import type { MetadataRoute } from "next";
import type { Category } from "@/types";

import { fetchHomeData } from "@/lib/server/home";
import { APP_URL } from "@/lib/site";
import { categoryPath } from "@/lib/structured-data";

/** 内容更新时间来自数据库触发器，按小时重新生成即可 */
export const revalidate = 3600;

/**
 * @description: 取分类与其站点里最新的 updated_at。
 * 内容没变，lastmod 就不该变；恒为「当前时间」的 sitemap 会被 Google 直接忽略。
 */
function latestUpdatedAt(category: Category): number | null {
  const stamps = [
    category.updated_at,
    ...(category.websites ?? []).map(({ updated_at }) => updated_at),
  ]
    .map((value) => new Date(value).getTime())
    .filter((time) => !Number.isNaN(time));

  return stamps.length ? Math.max(...stamps) : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let categories: Category[] = [];

  try {
    categories = await fetchHomeData();
  } catch {
    // 未配置环境变量或读库失败时仍返回首页，避免整份 sitemap 不可用
  }

  const homeTimestamps = categories
    .map(latestUpdatedAt)
    .filter((time): time is number => time !== null);

  return [
    {
      url: `${APP_URL}/`,
      lastModified: homeTimestamps.length
        ? new Date(Math.max(...homeTimestamps))
        : new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...categories.map((category) => {
      const time = latestUpdatedAt(category);

      return {
        url: `${APP_URL}${categoryPath(category.id)}`,
        lastModified: time === null ? new Date() : new Date(time),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    }),
  ];
}
