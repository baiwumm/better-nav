/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-21 16:33:59
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-11-23 11:00:00
 * @Description: 首页
 */
import type { Metadata } from "next";

import { Typography } from "@heroui/react";

import HomeContent from "@/components/HomeContent";
import StructuredData from "@/components/StructuredData";
import { fetchHomeData } from "@/lib/server/home";
import { APP_NAME, APP_SEO_KEYWORD } from "@/lib/site";
import { buildHomeJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

// ISR：后台写操作会通过 revalidatePath 主动失效，其余时间直接返回缓存，避免每次请求都打库
export const revalidate = 60;

export default async function Home() {
  const data = await fetchHomeData();
  // 导语里的数量随数据变化：给爬虫一段可引用的正文，而不是整页只有卡片标题
  const siteCount = data.reduce(
    (total, { websites }) => total + (websites?.length ?? 0),
    0,
  );

  return (
    <>
      {/* 页面级唯一 h1：承接 title 主词；各分类名仍是 h2，避免一屏多个 h1 */}
      <div className="flex flex-col gap-1">
        <Typography className="text-xl font-black tracking-normal" type="h1">
          {APP_SEO_KEYWORD}
        </Typography>
        <Typography color="muted" type="body-sm">
          {APP_NAME} 收录 {data.length} 个分类、{siteCount} 个常用网站，涵盖 AI
          工具、UI 组件库、交互动画与实用工具，按分类整理，打开就能用。
        </Typography>
      </div>
      <HomeContent data={data} />
      <StructuredData data={buildHomeJsonLd(data)} />
    </>
  );
}
