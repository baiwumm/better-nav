import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 登录页与后台均无需收录
      disallow: ["/login", "/admin"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
