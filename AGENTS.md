# Better Nav - AI 编程助手指南

> HeroUI v3 文档索引位于 `.heroui-docs/react`，使用任何 HeroUI 组件前必须先查阅对应文档。

---

## 项目概述

Better Nav 是一个基于 Next.js 16 与 Supabase 的个人导航站，专注于把常用网址集中管理，支持亮暗主题、响应式布局、登录后的网站分类与管理。

技术栈：Next.js 16 + React 19 + HeroUI v3 + Tailwind CSS v4 + Supabase + SWR + TanStack Table + Motion。

---

## 文档索引

详细内容拆分在 `docs/`，按需查阅，不要凭印象重复评估已定论的事项：

| 文档 | 内容 | 何时读 |
|------|------|--------|
| [docs/tech-stack.md](./docs/tech-stack.md) | 技术栈版本明细、环境变量全表、`site.ts` 兜底规则 | 配置环境变量、新增站点常量时 |
| [docs/code-standards.md](./docs/code-standards.md) | Lint 规则、TypeScript 规范、单元测试约定、Git 提交规范 | 写代码、补测试、提交前 |
| [docs/database.md](./docs/database.md) | Supabase 表结构、RLS 入口、存储桶、易踩坑细节 | 涉及数据库 / RLS / 存储桶改动时**必读** |
| [docs/tech-debt.md](./docs/tech-debt.md) | 已知技术欠账及「暂不处理」的完整理由 | 评估优化、重构、审查代码前**必读** |

项目介绍、环境变量、Supabase 配置与部署见 [README.md](./README.md)。

---

## 项目结构说明

```
better-nav/
├── .heroui-docs/          # HeroUI v3 组件文档（AI 参考用）
├── docs/                  # 项目文档（技术栈 / 代码规范 / 数据库 / 技术欠账，见上方文档索引）
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
│   ├── seed.sql           # 可选演示数据
│   └── 登录鉴权移植指南.md  # 三层白名单鉴权改动记录
├── tests/                 # node --test 单元测试，零测试依赖（约定见 docs/code-standards.md）
├── .env.example           # 环境变量示例
├── package.json           # 项目配置
├── next.config.ts         # Next.js 配置
├── eslint.config.mjs      # ESLint 配置
└── tsconfig.json          # TypeScript 配置
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

提交信息使用 Conventional Commits（feat / fix / docs / style / refactor / test / chore），详见 [docs/code-standards.md](./docs/code-standards.md)。

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

## 已知技术欠账（速览）

以下各项已评估并决定**暂不处理**，完整理由见 [docs/tech-debt.md](./docs/tech-debt.md)，不要重复评估：

- `use-admin-table-page` 无测试 —— 改动时需人工回归两个后台页面
- `react-aria` 在 store 中有 4 份副本 —— 不影响生产包
- 首页 `force-dynamic` + 全量数据下推客户端 —— 已用 `content-visibility` 缓解
- 13 处匿名函数 props —— 逐个改性价比低
- `formatBytes` 输出无空格 —— 既有输出格式，改动牵动所有引用处
