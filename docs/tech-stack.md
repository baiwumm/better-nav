# 技术栈与环境变量

> 拆分自 [AGENTS.md](../AGENTS.md)。配置环境变量或新增站点常量前先读本文。

## 核心技术栈

Next.js 16 + React 19 + HeroUI v3 + Tailwind CSS v4 + Supabase + SWR + TanStack Table + Motion。

精确版本以根目录 `package.json` 为准，本文不维护版本号。

## 环境变量

必须配置，缺失会导致登录、后台写入或 Logo 上传异常：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 项目连接信息 |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Logo 存储桶名，代码中无兜底，必须与实际桶名一致（默认 `logos`） |
| `ADMIN_EMAILS` | 管理员邮箱白名单，逗号分隔、小写比对，必须与 `schema.sql` 的 `is_admin()` 白名单一致 |

其余变量（站点名 / 描述 / 作者 / ICP / 统计 ID 等）全部可选：留空则不渲染对应区块或从 metadata 中省略。完整清单与示例值见根目录 [`.env.example`](../.env.example)。

运行时读取 `.env.local`（已被 gitignore，不提交）。新增环境变量时同步更新 `.env.example` 与 README 的环境变量清单。

## 站点级常量兜底

站点级常量（`APP_URL`/`APP_NAME`/`APP_TITLE` 等的兜底值）统一在 `src/lib/site.ts`，不要在 metadata / og 图 / sitemap / robots 各处重复写默认值。
