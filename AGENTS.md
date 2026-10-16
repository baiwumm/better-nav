# Better Nav - AI 编程助手指南

> 使用任何 HeroUI 组件前，先查 `.heroui-docs/react` 对应文档（组件文档在 `components/` 下按分类组织）。
> 所有代码产出（新建组件/页面、数据获取、重构、性能优化）遵循 `.agents/skills/vercel-react-best-practices` 性能规范。

## 项目

Better Nav：基于 Next.js 16 + React 19 + HeroUI v3 + Tailwind CSS v4 + Supabase 的个人导航站，集中管理常用网址，支持亮暗主题、响应式布局、登录后的分类与站点管理。

## 按需查阅

| 场景 | 文档 |
|------|------|
| 配置环境变量、新增站点常量 | [docs/tech-stack.md](./docs/tech-stack.md) |
| 写代码、补测试、提交前 | [docs/code-standards.md](./docs/code-standards.md) |
| 数据库 / RLS / 存储桶改动（必读） | [docs/database.md](./docs/database.md) |
| 优化 / 重构 / 代码审查前（必读，已定论勿重复评估） | [docs/tech-debt.md](./docs/tech-debt.md) |
| Supabase 控制台配置、部署 | [README.md](./README.md) |

## 命令

| 任务 | 命令 |
|------|------|
| 安装依赖 | `pnpm install` |
| 本地开发 | `pnpm dev` |
| 提交前检查 | `pnpm lint`（= `eslint && tsc --noEmit && pnpm test`，跑这一个即可） |
| 仅单元测试 | `pnpm test` |
| 生产构建 | `pnpm build` |

提交信息用 Conventional Commits（类型清单见 docs/code-standards.md）。

## 禁改文件（破例必须先征得人工同意）

- `src/types/table-types.ts` — TanStack Table v9 统一类型定义，无例外
- `eslint.config.mjs` — 改动可能导致 CI 失败，无例外
- `src/lib/supabase/*.ts` — 认证安全核心：`getClaims` 验签、`requireAdmin`、白名单比对、未登录重定向
- `next.config.ts` — 仅限两类改动：硬编码值改为环境变量派生、收紧构建校验；不得重新引入 `typescript.ignoreBuildErrors`

`src/lib/supabase/proxy.ts` 中的公开可写路由白名单 `PUBLIC_WRITE_API_ROUTES` 是 `src/lib/supabase` 禁令的唯一豁免口：只允许追加具体路径，不得削弱「其余写接口要求登录 + 管理员」，并在提交信息里说明原因。

## 代码约定

- UI 基于 HeroUI 组件搭建，样式用 Tailwind CSS utility；HeroUI 覆盖不到的需求先查文档，确认无解再询问人工
- 客户端数据获取走 SWR：hook 在 `src/hooks/use-swr.ts`，fetcher 与全局配置在 `src/lib/swr.ts`
- 任何数据库操作必须经过 RLS 策略（表结构与易踩坑细节见 docs/database.md）
- 组件目录入口统一命名 `index.tsx`
- 项目规范之间冲突时（如 HeroUI 用法与 Vercel 建议相悖），停下询问人工，不自行取舍
