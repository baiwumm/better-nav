/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-21 16:33:59
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-11-23 12:00:00
 * @Description: 首页
 */
import type { Metadata } from "next";

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

  return (
    <>
      {/* 页面级唯一 h1，只在无障碍树与爬虫里存在，不占视觉；各分类名仍是 h2 */}
      <h1 className="sr-only">
        {APP_NAME} {APP_SEO_KEYWORD}
      </h1>
      <HomeContent data={data} />
      <StructuredData data={buildHomeJsonLd(data)} />
    </>
  );
}
