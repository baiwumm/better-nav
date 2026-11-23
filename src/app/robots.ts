import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      // 单一通配组：具名爬虫组会覆盖 * 规则，反而把名单外的 AI 检索爬虫挡在门外
      userAgent: "*",
      allow: "/",
      // /login 故意不屏蔽：抓不到就看不到 noindex，只能以裸 URL 留在索引里，
      // 其 noindex 由 src/app/login/layout.tsx 下发
      disallow: ["/admin", "/api/", "/auth/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
