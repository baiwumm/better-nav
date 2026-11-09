# 技术栈与环境变量

> 拆分自 [AGENTS.md](../AGENTS.md)。配置环境变量或新增站点常量前先读本文。

## 核心技术栈

Next.js 16 + React 19 + HeroUI v3 + Tailwind CSS v4 + Supabase + SWR + TanStack Table + Motion。

精确版本以根目录 `package.json` 为准，本文不维护版本号。

## 环境变量

必须配置，缺失会导致登录、后台写入或 Logo 上传异常：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 项目连接信息 |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Logo 存储桶名，代码中无兜底，必须与实际桶名一致（默认 `logos`） |

其余变量（站点名 / 描述 / ICP / 统计 ID 等）全部可选：留空则不渲染对应区块或从 metadata 中省略。完整清单与示例值见根目录 [`.env.example`](../.env.example)。

作者信息（昵称 / bio / 头像）不走环境变量：统一从 GitHub 账户自动拉取（用户名取自 `package.json` 的 git 地址 owner，显示信息带一天缓存），见 `src/lib/author.ts`。用户菜单的头像按「GitHub 身份头像 → 登录资料头像 → 本地 `public/avatar.jpg`」兜底，见 `src/lib/user-profile.ts`。

配置步骤、初始化 SQL 的执行方式与部署验证见 [supabase-deployment.md](./supabase-deployment.md)。

另有 `DATABASE_URL`（数据库直连串）与 `SUPABASE_SECRET_KEY`（`sb_secret_` 密钥，可调 Auth Admin API）两个**本地运维变量**：应用运行时不读取，仅本地 `.env` 里供管理脚本（直连改库、批量管理用户）使用。因此它们不进 `.env.example`、不配到 Vercel；都是机密，不得加 `NEXT_PUBLIC_` 前缀。

运行时读取 `.env.local`（已被 gitignore，不提交）。新增环境变量时同步更新 `.env.example` 与 README 的环境变量清单。

## 站点级常量兜底

站点级常量（`APP_URL`/`APP_NAME`/`APP_TITLE` 等的兜底值）统一在 `src/lib/site.ts`，不要在 metadata / og 图 / sitemap / robots 各处重复写默认值。
