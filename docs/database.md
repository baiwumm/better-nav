# 数据库表结构参考

> 拆分自 [AGENTS.md](../AGENTS.md)。涉及数据库、RLS 或存储桶改动前**必读**本文。

项目依赖以下 Supabase 对象：

- `ds_categorys`：分类表
- `ds_websites`：网站表
- `increment_visit_count(row_id uuid)`：访问计数函数，`security definer`（表开启 RLS 后匿名访客靠它才能写入计数）
- `is_admin()`：管理员邮箱白名单判定，RLS 写权限的唯一入口
- `logos`：Logo 存储桶，公开读、仅管理员写

完整初始化 SQL 见 [`supabase/schema.sql`](../supabase/schema.sql)（幂等，可重复执行），演示数据见 [`supabase/seed.sql`](../supabase/seed.sql)。

注意两处易踩坑的细节：

1. `visitCount`、`commonlyUsed` 是带引号的驼峰列名，前端类型与 PostgREST 返回字段直接使用它们，不要在没牵动类型和列定义的情况下改名
2. `ds_websites.category_id` 外键故意不加 `on delete cascade`，分类下仍有站点时删除分类会被拒绝，避免连带删站点数据

## 相关文档

- Supabase 控制台配置步骤与常见问题见 [README.md](../README.md)
- 三层白名单鉴权的完整改动点见 [`supabase/登录鉴权移植指南.md`](../supabase/登录鉴权移植指南.md)
