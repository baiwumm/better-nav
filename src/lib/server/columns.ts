/**
 * 公开读接口的列白名单。
 *
 * `user_id` / `email` 只用于后台归属与审计，不下发给匿名访客：
 * 首页 RSC、列表 API 以及 Supabase 的匿名列级授权（schema.sql 第 6 段）
 * 都依赖这里的清单，新增公开字段时三处要一起改。
 *
 * 用字面量常量而不是 join()，supabase-js 才能在类型层解析 select 语句。
 */

export const PUBLIC_CATEGORY_FIELDS =
  "id,name,sort,created_at,updated_at" as const;

export const PUBLIC_WEBSITE_FIELDS =
  "id,name,desc,logo,url,tags,sort,pinned,vpn,recommend,commonlyUsed,visitCount,category_id,created_at,updated_at" as const;

export const PUBLIC_CATEGORY_SELECT =
  `${PUBLIC_CATEGORY_FIELDS},websites:ds_websites(${PUBLIC_WEBSITE_FIELDS})` as const;

export const PUBLIC_WEBSITE_SELECT =
  `${PUBLIC_WEBSITE_FIELDS},category:ds_categorys(${PUBLIC_CATEGORY_FIELDS})` as const;
