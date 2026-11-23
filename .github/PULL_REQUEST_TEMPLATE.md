## 变更说明

<!-- 一句话说明「为什么改」，以及改前改后的行为差异 -->

Closes #

## 涉及范围

- [ ] 页面与路由（`src/app`）
- [ ] 组件（`src/components`）
- [ ] 数据层与接口（`src/lib`、`src/app/api`）
- [ ] 数据库 / RLS / 存储桶（`supabase/schema.sql`）
- [ ] SEO / 元信息 / 结构化数据
- [ ] 仅仓库级（`docs/`、`.github/`、根配置）

## 一致性与真源检查

- [ ] 若改公开页：仍是 ISR（读库不经过 `cookies()`），且相关写接口已调用 `revalidatePublicPages()`
- [ ] 若改数据库：`schema.sql`、`src/lib/server/columns.ts` 与 `docs/database.md` 三处同步，脚本保持幂等
- [ ] 若改 metadata：标题主词与页面 h1 一致，canonical 与 sitemap 指向同一 URL
- [ ] 未改动禁改文件（`src/types/table-types.ts`、`eslint.config.mjs`、`src/lib/supabase/*.ts`），或已在下方说明并取得同意
- [ ] 行为变化已回写对应文档（技术栈 / 数据库 / 部署 / 技术欠账）

## 验证结果

<!-- 填实际跑过的命令与结果；未跑的项写明原因 -->

- 本地 `pnpm lint`：
- 本地 `pnpm build`：

## 截图 / 录屏

<!-- UI 变更必填；无视觉变化可删除本节 -->
