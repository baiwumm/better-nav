import type { MetadataRoute } from "next";

import { createClient } from "@supabase/supabase-js";

import { APP_URL } from "@/lib/site";

/** 内容更新时间来自数据库触发器，按小时重新生成即可 */
export const revalidate = 3600;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * @description: 取分类与站点两张表里最新的 updated_at 作为首页 lastmod。
 *
 * 之前每次请求都报「刚刚更新」，这种恒定变化的 lastmod 会被 Google 直接忽略。
 * 读不到库（未配置环境变量或请求失败）时退回当前时间，保证 sitemap 仍能生成。
 */
async function latestUpdatedAt(): Promise<Date> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Date();
  }

  try {
    // 匿名只读：公开列的读取范围由 RLS 与列级授权共同限制
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const [category, website] = await Promise.all([
      supabase
        .from("ds_categorys")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1),
      supabase
        .from("ds_websites")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1),
    ]);
    const stamps = [category.data, website.data]
      .map(
        (rows) => (rows as { updated_at?: string }[] | null)?.[0]?.updated_at,
      )
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()));

    if (!stamps.length) {
      return new Date();
    }

    return new Date(Math.max(...stamps.map((date) => date.getTime())));
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${APP_URL}/`,
      lastModified: await latestUpdatedAt(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
