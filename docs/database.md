# 数据库表结构参考

> 拆分自 [AGENTS.md](../AGENTS.md)。涉及数据库、RLS 或存储桶改动前**必读**本文。

项目依赖以下 Supabase 对象：

- `ds_categorys`：分类表
- `ds_websites`：网站表
- `increment_visit_count(row_id uuid)`：访问计数函数，`security definer`（表开启 RLS 后匿名访客靠它才能写入计数）
- `logos`：Logo 存储桶，公开读、仅已登录用户写

完整初始化 SQL 见 [`supabase/schema.sql`](../supabase/schema.sql)，演示数据见 [`supabase/seed.sql`](../supabase/seed.sql)。

写权限模型是「已登录即可写」：两张表和 `logos` 桶的写策略都是 `to authenticated`，不做邮箱或角色判定。它成立的前提是 Supabase 关闭注册（Allow new users to sign up），账号只通过 Dashboard 的 Add user 添加。**不要打开注册**，否则任何人注册后都能改库。

**schema.sql 只面向全新项目。** 它是幂等的，但幂等不等于可以在已有线上库整跑：脚本会 DROP 并重建两张表上的全部 RLS 策略（完整警示见 README「Supabase 配置」节）。不要对有数据的生产库建议执行整份脚本。

数据库变更的落地方式：本项目没有迁移目录，`schema.sql` 是表结构的唯一权威定义——变更直接改它并保持幂等；已有线上库由人工在 Dashboard 执行。

注意两处易踩坑的细节：

1. `visitCount`、`commonlyUsed` 是带引号的驼峰列名，前端类型与 PostgREST 返回字段直接使用它们，不要在没牵动类型和列定义的情况下改名
2. `ds_websites.category_id` 外键故意不加 `on delete cascade`，分类下仍有站点时删除分类会被拒绝，避免连带删站点数据

## 相关文档

- Supabase 控制台配置步骤与常见问题见 [README.md](../README.md)
- 已废弃的邮箱白名单鉴权方案（历史记录）见 [`supabase/登录鉴权移植指南.md`](../supabase/登录鉴权移植指南.md)
