/**
 * @description: 站点级常量（环境变量 + 统一兜底）
 *
 * metadata / OG 图 / sitemap / robots 都依赖这组值，兜底必须集中在一处：
 * 未配置 NEXT_PUBLIC_APP_URL 时若各自写默认值，robots 会下发 `undefined/sitemap.xml`，
 * sitemap 会下发空串，og 图又会指向别人的域名，收录与分享行为直接错乱。
 *
 * NEXT_PUBLIC_ 前缀变量在构建期内联，服务端与客户端模块均可直接引用。
 */

/** 站点基础 URL。未配置时回落到线上地址，保证 og/sitemap/robots 始终指向可用的绝对地址 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://nav.baiwumm.com";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Better Nav";

export const APP_TITLE =
  process.env.NEXT_PUBLIC_APP_TITLE || "一个把常用网址收拾得干干净净的小站";

export const APP_DESC =
  process.env.NEXT_PUBLIC_APP_DESC || "把常用网址放在一起，打开就能用。";

/** 无兜底：未配置时从 metadata 中省略，避免强塞营销词 */
export const APP_KEYWORDS = process.env.NEXT_PUBLIC_APP_KEYWORDS;

export const AUTHOR_NAME = process.env.NEXT_PUBLIC_AUTHOR_NAME || "白雾茫茫丶";

export const AUTHOR_ROLE = process.env.NEXT_PUBLIC_AUTHOR_ROLE || "独立开发者";

/** OG 图片地址：交给 Next.js 的 /opengraph-image 路由动态生成 */
export const OG_IMAGE_URL = `${APP_URL}/opengraph-image`;
