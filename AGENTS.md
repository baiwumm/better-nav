# Better Nav - AI 编程助手指南

> HeroUI v3 文档索引位于 `.heroui-docs/react`，使用任何 HeroUI 组件前必须先查阅对应文档。

---

## 项目概述

Better Nav 是一个基于 Next.js 16 与 Supabase 的个人导航站，专注于把常用网址集中管理，支持亮暗主题、响应式布局、登录后的网站分类与管理。

---

## 项目结构说明

```
better-nav/
├── .heroui-docs/          # HeroUI v3 组件文档（AI 参考用）
├── public/                # 静态资源（logo、截图等）
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── admin/         # 后台管理页面（局部组件在 admin/components，自带 loading.tsx）
│   │   ├── api/           # API 路由：auth/me、categorys、websites、client-errors
│   │   ├── login/         # 登录页（自带 loading.tsx）
│   │   ├── layout.tsx     # 根布局
│   │   ├── page.tsx       # 首页
│   │   ├── Provider.tsx   # 客户端 Provider
│   │   ├── loading.tsx    # 根路由 Loading
│   │   ├── error.tsx      # 路由段错误边界
│   │   ├── global-error.tsx # 根布局错误边界（自备 html/body）
│   │   ├── not-found.tsx
│   │   ├── manifest.json  # PWA 清单
│   │   ├── robots.ts      # robots.txt（屏蔽 /login、/admin）
│   │   ├── sitemap.ts
│   │   └── opengraph-image.tsx
│   ├── components/        # 通用组件
│   │   ├── ui/            # 跨模块复用的基础组件
│   │   └── Admin*         # 后台共享件：AdminDataTable / AdminDeleteDialog / AdminHeaderContent
│   ├── hooks/             # 自定义 Hooks
│   │   ├── use-supabase-client.ts  # 浏览器端 Supabase 客户端，模块级单例
│   │   ├── use-admin-table-page.ts # 后台列表页状态机（分页/排序/列可见性/行选择）
│   │   ├── use-supabase-user.ts
│   │   ├── use-file-upload.tsx
│   │   └── use-swr.ts
│   ├── lib/               # 工具库
│   │   ├── server/        # 服务端工具（首页数据 / Logo / 排序）
│   │   ├── supabase/      # Supabase 客户端与 middleware 代理
│   │   ├── site.ts        # 站点级常量与统一兜底（APP_URL 等）
│   │   ├── report-error.ts # 客户端错误上报（接 Sentry 只改这里）
│   │   ├── request.ts     # SWR fetcher（统一错误提示 + 超时）
│   │   ├── utils.ts       # 通用工具函数（含 formatBytes）
│   │   ├── crop-image.ts  # 头像裁剪
│   │   ├── icons.tsx      # 自定义图标
│   │   └── swr.ts         # SWR 配置
│   ├── types/             # TypeScript 类型定义
│   └── proxy.ts           # 代理配置
├── supabase/              # Supabase SQL 脚本
│   ├── schema.sql         # 数据库初始化脚本（建表 / 函数 / 触发器 / RLS / 存储桶）
│   ├── seed.sql            # 可选演示数据
│   └── 登录鉴权移植指南.md  # 三层白名单鉴权改动记录
├── tests/                 # node --test 单元测试，零测试依赖（见下方说明）
├── .env.example           # 环境变量示例
├── package.json           # 项目配置
├── next.config.ts         # Next.js 配置
├── eslint.config.mjs      # ESLint 配置
└── tsconfig.json          # TypeScript 配置
```

---

## 技术栈与环境变量

### 核心技术栈

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

### 必须配置的环境变量

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

站点级常量（`APP_URL`/`APP_NAME`/`APP_TITLE` 等的兜底值）统一在 `src/lib/site.ts`，不要在 metadata / og 图 / sitemap / robots 各处重复写默认值。

---

## 代码规范与质量门禁

### Lint 规则

项目使用 ESLint + Prettier 进行代码格式化：

```bash
pnpm lint          # 检查代码（ESLint + tsc --noEmit + pnpm test）
pnpm lint:fix      # 自动修复
pnpm test          # 仅跑单元测试
```

**必须遵守的规则：**
- 使用 `unused-imports` 插件移除未使用的导入
- 导入顺序：type > builtin > object > external > internal > parent > sibling > index
- 组件属性排序：callbacksLast > shorthandFirst > reservedFirst
- 自闭合组件标签：`<Component />` 而非 `<Component></Component>`
- `return` 语句前必须空一行
- 禁止 `console` 输出（warn 级别）

### TypeScript 规范

- 所有组件和工具函数必须使用 TypeScript
- 未使用的变量以 `_` 前缀命名（如 `_unused`）
- 优先使用 `AppTableFeatures`、`AppColumnDef` 等项目统一类型

### 单元测试

项目用 **Node 24 自带的 `node --test`**，不引入 jest/vitest。Node 24 可直接执行 `.ts`，
所以测试文件里 `import ... from "../src/lib/utils.ts"` 这类显式扩展名原生可解析
（`tsconfig.json` 里对应开了 `allowImportingTsExtensions`）。

因此当前**只能测纯函数**。涉及 React 渲染、hook 的用例需要 router context，
必须另配渲染器，本项目功能简单、暂不引入。

- `tests/sort.test.ts` — `sortWebsites` 四层排序优先级、非变异语义（防回归到原地 `.sort()`）
- `tests/utils.test.ts` — `formatBytes`（含越界收敛）、`get`、`responseMessage`、`formatDate`

新增测试放 `tests/*.test.ts`，`pnpm test` 自动发现，`pnpm lint` 会一并执行。

### Git 提交规范

使用 Conventional Commits 格式：

```
feat: 新功能
fix: 修复
docs: 文档更新
style: 代码格式（不影响逻辑）
refactor: 重构
test: 测试
chore: 构建/工具变动
```

---

## 常用开发命令

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务
pnpm start

# 代码检查与修复
pnpm lint
pnpm lint:fix

# 单元测试（node --test，零测试依赖）
pnpm test

# 发布版本
pnpm release
```

---

## AI 使用约束（强制规范）

本项目已集成 `@vercel/react-best-practices`（ESLint 插件）和 `HeroUI` 组件库。

### 禁止修改的文件

以下文件涉及认证安全或全局行为，默认不要动。**破例前必须先向人工确认，不得自行决定。**

- `src/types/table-types.ts` — TanStack Table v9 统一类型定义。无例外。
- `eslint.config.mjs` — ESLint 配置，修改可能导致 CI 失败。无例外。
- `src/lib/supabase/*.ts` — 认证安全核心：`getClaims` 验签、`requireAdmin`、白名单比对、未登录重定向逻辑一律不得改动。
  唯一已知例外是 `proxy.ts` 里的**公开可写路由白名单** `PUBLIC_WRITE_API_ROUTES`（当前为 `/api/client-errors`）。新增此类例外时只能往白名单里加具体路径，并保持「其余写接口仍要求登录 + 管理员」不被削弱，且在提交信息里说明原因。
- `next.config.ts` — 影响构建行为。
  例外仅限两类：① 把硬编码值改为环境变量派生；② 收紧构建校验。
  **不得重新引入 `typescript.ignoreBuildErrors`** —— 类型检查已由 `pnpm lint` 内的 `tsc --noEmit` 与 `next build` 双重覆盖。

### 必须遵守的约束

1. **UI 组件必须使用 HeroUI**：禁止引入其他 UI 库（如 Ant Design、Material UI）
2. **数据获取使用 SWR**：客户端数据获取必须通过 `src/hooks/use-swr.ts` 或 `src/lib/swr.ts`
3. **样式必须使用 Tailwind CSS**：禁止内联样式或 CSS-in-JS
4. **Supabase 操作必须经过 RLS**：任何数据库操作必须遵循 Row Level Security 策略
5. **组件文件使用 `index.tsx` 命名**：每个组件目录下统一使用 `index.tsx` 作为入口

### AI 代码生成守则

1. **性能第一**：严格遵守 Vercel React 官方性能优化指南（使用 memo、useCallback、避免匿名函数 props）
2. **组件优先**：所有 UI 元素必须基于 HeroUI 组件构建，严禁使用纯 div+CSS 模拟 HeroUI 已有功能（如 Modal、Dropdown）
3. **自检机制**：生成代码后，AI 必须主动检查是否违反上述两条规则，如有违反需重写
4. **异常处理**：若规则库之间存在冲突（例如 HeroUI 某个组件用法与 Vercel 建议相悖），AI 需主动提问并等待人工裁决，不得擅自决定
5. **代码生成与重构必须遵循 `vercel-react-best-practices` Skill**：该 Skill 已安装于 `.agents/skills/vercel-react-best-practices`，是所有代码产出（新建组件/页面、数据获取、重构、性能优化）的硬性性能与正确性规范

### 推荐使用的工具库

| 库 | 用途 | 文档位置 |
|----|------|----------|
| HeroUI | UI 组件 | `.heroui-docs/react` |
| SWR | 数据获取 | `src/lib/swr.ts` |
| TanStack Table | 表格 | `src/types/table-types.ts` |
| Motion | 动画 | 已安装 |
| react-easy-crop | 图片裁剪 | `src/lib/crop-image.ts` |

---

## 已知技术欠账

记录在案、暂不处理的项，避免下一轮重复评估：

| 欠账 | 说明 |
|------|------|
| `use-admin-table-page` 无测试 | 内部走 `useSwrQuery` → `@bprogress/next` 的 `useProgress`，需要 router context。覆盖它必须引入 vitest + testing-library + jsdom，已评估后决定不引（项目功能简单）。它是目前风险最集中的未覆盖代码，改动时需人工回归两个后台页面 |
| `react-aria` 在 store 中有 4 份副本 | 来源是 devDependency 链（`eslint-plugin-jsx-a11y` → `@adobe/react-spectrum`），与根依赖是否显式声明无关，删掉也减不了副本。不影响生产包 |
| 首页 `force-dynamic` + 全量数据下推客户端 | 已用 `content-visibility` 缓解渲染成本。当前 8 分类 / 72 站点，数据量未到需要分页的规模 |
| 13 处匿名函数 props | 违反上方「性能第一」守则，属洁癖项，逐个改性价比低 |
| `formatBytes` 输出无空格 | 拼接为 `"1KB"` 而非 `"1 KB"`，属既有输出格式，改动会牵动所有引用处文案 |

---

## 数据库表结构（参考）

项目依赖以下 Supabase 对象：

- `ds_categorys`：分类表
- `ds_websites`：网站表
- `increment_visit_count(row_id uuid)`：访问计数函数，`security definer`（表开启 RLS 后匿名访客靠它才能写入计数）
- `is_admin()`：管理员邮箱白名单判定，RLS 写权限的唯一入口
- `logos`：Logo 存储桶，公开读、仅管理员写

完整初始化 SQL 见 `supabase/schema.sql`（幂等，可重复执行），演示数据见 `supabase/seed.sql`。

注意两处易踩坑的细节：

1. `visitCount`、`commonlyUsed` 是带引号的驼峰列名，前端类型与 PostgREST 返回字段直接使用它们，不要在没牵动类型和列定义的情况下改名
2. `ds_websites.category_id` 外键故意不加 `on delete cascade`，分类下仍有站点时删除分类会被拒绝，避免连带删站点数据

---

## 部署说明

推荐部署到 Vercel：

1. Fork 本项目
2. 在 Vercel 中导入仓库
3. 配置环境变量
4. 点击 Deploy

---

## 相关链接

- 在线预览：https://dream.baiwumm.com/
- GitHub：https://github.com/baiwumm/better-nav
- 作者：https://baiwumm.com
