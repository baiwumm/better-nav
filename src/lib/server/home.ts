import type { Category } from "@/types";

import { cache } from "react";

import { sortWebsites } from "@/lib/server/sort";
/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-08-10 10:00:00
 * @Description: 首页服务端数据
 */
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * @description: 首页数据（全部分类 + 网站），服务端直接查询
 * 查询与排序逻辑与 /api/categorys 保持一致，供 RSC 页面复用
 * React.cache 保证同一请求内多处调用只查一次库
 */
export const fetchHomeData = cache(async (): Promise<Category[]> => {
  const supabase = await getSupabaseServerClient();

  // 查询 sql
  const { data, error } = await supabase
    .from("ds_categorys")
    .select("*,websites:ds_websites(*)")
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
    if (category?.websites) sortWebsites(category.websites);
  });

  return list;
});
