/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-21 16:33:59
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-10-09 10:00:00
 * @Description: 首页
 */
import HomeContent from "@/components/HomeContent";
import { fetchHomeData } from "@/lib/server/home";
import { APP_NAME } from "@/lib/site";

// 每次访问拉取最新数据，保证后台变更即时生效（后续可优化为 ISR/tag 缓存）
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await fetchHomeData();

  return (
    <>
      {/* 页面级唯一 h1：各分类名降级为 h2，避免一屏出现多个 h1 */}
      <h1 className="sr-only">{APP_NAME} 网站导航</h1>
      <HomeContent data={data} />
    </>
  );
}
