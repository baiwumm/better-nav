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

/**
 * 首页 SEO 主词：title / h1 前置用。
 * 与 APP_TITLE（调性文案）分开维护，避免调性文案把主词挤出 SERP 的可见区。
 */
export const APP_SEO_KEYWORD = "常用网址导航";

/** 首页 SEO 标题：主词前置 + 品牌 + 点击理由，控制在 30 个汉字宽以内 */
export const APP_SEO_TITLE = `${APP_SEO_KEYWORD}｜${APP_NAME}·精选开发者与设计资源`;

/**
 * 首页 SEO 描述：以 APP_DESC 打底再补足收录范围，中文 60–120 字。
 * 过短的描述会被 Google 用正文改写，等于放弃对首屏文案的控制权。
 */
export const APP_SEO_DESC = `${APP_NAME}：${APP_DESC}精选 AI 工具、UI 组件库、交互动画与实用工具，按分类整理，持续更新。`;

/** OG 图片地址：交给 Next.js 的 /opengraph-image 路由动态生成 */
export const OG_IMAGE_URL = `${APP_URL}/opengraph-image`;
