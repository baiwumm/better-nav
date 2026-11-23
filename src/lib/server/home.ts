import type { Category } from "@/types";

import { cache } from "react";

import { PUBLIC_CATEGORY_SELECT } from "@/lib/server/columns";
import { getSupabasePublicClient } from "@/lib/server/public-client";
import { sortWebsites } from "@/lib/server/sort";

/**
 * @description: 首页与分类页数据（全部分类 + 网站）。
 *
 * 读库走公开只读客户端（不带 cookies），页面才能被 ISR 预渲染并缓存；
 * 查询与排序逻辑与 /api/categorys 保持一致，供 RSC 页面复用。
 * React.cache 保证同一请求内多处调用（如 generateMetadata 与页面本身）只查一次库。
 */
export const fetchHomeData = cache(async (): Promise<Category[]> => {
  const supabase = getSupabasePublicClient();

  // 查询 sql
  const { data, error } = await supabase
    .from("ds_categorys")
    .select(PUBLIC_CATEGORY_SELECT)
    .order("sort", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  // 执行失败
  if (error) {
    throw new Error(error.message);
  }

  const list = data ?? [];

  list.forEach((category: Category) => {
    if (category?.websites) {
      category.websites = sortWebsites(category.websites);
    }
  });

  return list;
});
