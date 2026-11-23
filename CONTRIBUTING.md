# 贡献指南

感谢愿意花时间改进 Better Nav。提 PR 前请先读这一页，以及 [`AGENTS.md`](./AGENTS.md) 里的项目约定。

## 环境要求

- Node.js 24（`pnpm test` 依赖 `node --test` 直接执行 `.ts`；Next.js 16 最低要求 20.9）
- pnpm（版本由 `package.json` 的 `packageManager` 字段锁定）

## 本地启动

```bash
pnpm install
cp .env.example .env.local   # 填入自己的 Supabase URL 与 publishable key
pnpm dev
```

首次部署还要执行 `supabase/schema.sql`，步骤见 [`docs/supabase-deployment.md`](./docs/supabase-deployment.md)。

## 提交前必须通过

```bash
pnpm lint    # eslint + tsc --noEmit + node --test，跑这一个即可
pnpm build   # 改了页面、路由或构建配置时再跑
```

`pnpm lint` 会加载 `.env.local` 吗？不会：lint 与测试都不碰 Supabase；只有 `pnpm build` 需要环境变量。

## 提交信息

使用 Conventional Commits（`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `perf`）。

会话中有 AI 参与时，按 `ai-commit-trailer` skill 追加 trailer 块，要点见 `AGENTS.md` 的「AI 参与的提交」一节。

## 代码约定（摘要）

完整清单见 `AGENTS.md`，最常踩的几条：

- UI 用 HeroUI 组件 + Tailwind utility，自研前先查 `.heroui-docs/react`
- 组件目录入口统一 `index.tsx`
- 数据库操作必须经过 RLS，不要引入绕过策略的服务端直连
- 公开页是 ISR 预渲染的：写操作走 `/api`，并在成功后调用 `revalidatePublicPages()`
- `src/lib/supabase/*.ts`、`src/types/table-types.ts`、`eslint.config.mjs` 属禁改文件，改动前先开 issue 讨论
- 禁止把 `NEXT_PUBLIC_*` 之外的密钥写进代码或提交

## 报告问题

- 可复现的缺陷 → [Bug report](https://github.com/baiwumm/better-nav/issues/new?template=bug_report.yml)
- 使用与部署问题 → [Discussions Q&A](https://github.com/baiwumm/better-nav/discussions/categories/q-a)
- 安全问题 → 走私密报告，见 [`SECURITY.md`](./SECURITY.md)

## PR 流程

1. 开 issue 或 discussion 说明要解决的问题（小的文档/拼写修正可直接提 PR）
2. 一个 PR 只做一件事，避免夹带无关重构
3. 填完 PR 模板里的验证结果，尤其是 `pnpm lint` 与 `pnpm build` 的实际输出
4. CI 全绿后由维护者合并；依赖类 PR 由 Dependabot 在检查通过后自动合并
