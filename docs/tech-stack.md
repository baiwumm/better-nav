# 技术栈与环境变量

> 拆分自 [AGENTS.md](../AGENTS.md)。配置环境变量或新增站点常量前先读本文。

## 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.4.0 | 框架 |
| React | 19.2.8 | UI 库 |
| HeroUI | 3.2.6 | 组件库 |
| Tailwind CSS | 4.3.3 | 样式 |
| Supabase | - | 后端服务 |
| SWR | 2.5.1 | 数据获取 |
| TanStack Table | 9.2.4 | 表格组件 |
| Motion | 13.2.0 | 动画 |

## 必须配置的环境变量

```bash
# Supabase（必须）
NEXT_PUBLIC_SUPABASE_URL=          # Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase 匿名密钥
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=logos  # 存储桶名称

# 管理员配置（必须）
ADMIN_EMAILS=your-admin@example.com  # 管理员邮箱白名单（逗号分隔）

# 应用配置（可选，有默认值）
NEXT_PUBLIC_APP_NAME=Better Nav
NEXT_PUBLIC_APP_TITLE=一个把常用网址收拾得干干净净的小站
NEXT_PUBLIC_APP_DESC=把常用网址放在一起，打开就能用。
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTHOR_NAME=白雾茫茫丶
NEXT_PUBLIC_AUTHOR_ROLE=独立开发者

# 以下可选，留空则不渲染对应区块
NEXT_PUBLIC_APP_KEYWORDS=Better Nav,常用网站,网站入口,工具入口
NEXT_PUBLIC_ICP=
NEXT_PUBLIC_GUAN_ICP=
NEXT_PUBLIC_GOOGLE_ID=
NEXT_PUBLIC_CLARITY_ID=
```

完整示例见根目录 [`.env.example`](../.env.example)。

## 站点级常量兜底

站点级常量（`APP_URL`/`APP_NAME`/`APP_TITLE` 等的兜底值）统一在 `src/lib/site.ts`，不要在 metadata / og 图 / sitemap / robots 各处重复写默认值。
