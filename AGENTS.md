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
│   ├── app/               # Next.js App Router 页面
│   │   ├── admin/         # 后台管理页面
│   │   ├── api/           # API 路由
│   │   ├── login/         # 登录页
│   │   ├── layout.tsx     # 根布局
│   │   ├── page.tsx       # 首页
│   │   └── Provider.tsx   # 客户端 Provider
│   ├── components/        # 通用组件
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具库
│   │   ├── server/        # 服务端工具
│   │   ├── supabase/      # Supabase 客户端
│   │   ├── utils.ts       # 通用工具函数
│   │   └── swr.ts         # SWR 配置
│   ├── types/             # TypeScript 类型定义
│   └── proxy.ts           # 代理配置
├── supabase/              # Supabase SQL 脚本
│   ├── rls.sql            # Row Level Security 策略
│   └── rls.sql.example    # RLS 示例
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
| Next.js | 16.3.4 | 框架 |
| React | 19.2.8 | UI 库 |
| HeroUI | 3.2.4 | 组件库 |
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
```

---

## 代码规范与质量门禁

### Lint 规则

项目使用 ESLint + Prettier 进行代码格式化：

```bash
pnpm lint          # 检查代码
pnpm lint:fix      # 自动修复
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

# 发布版本
pnpm release
```

---

## AI 使用约束（强制规范）

本项目已集成 `@vercel/react-best-practices`（ESLint 插件）和 `HeroUI` 组件库。

### 禁止修改的文件

- `src/lib/supabase/*.ts` — Supabase 客户端配置，涉及认证安全
- `src/types/table-types.ts` — TanStack Table v9 统一类型定义
- `eslint.config.mjs` — ESLint 配置，修改可能导致 CI 失败
- `next.config.ts` — Next.js 配置，影响构建行为

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

### 推荐使用的工具库

| 库 | 用途 | 文档位置 |
|----|------|----------|
| HeroUI | UI 组件 | `.heroui-docs/react` |
| SWR | 数据获取 | `src/lib/swr.ts` |
| TanStack Table | 表格 | `src/types/table-types.ts` |
| Motion | 动画 | 已安装 |
| react-easy-crop | 图片裁剪 | `src/lib/crop-image.ts` |

---

## 数据库表结构（参考）

项目依赖以下 Supabase 表：

- `ds_categorys`：分类表
- `ds_websites`：网站表
- `increment_visit_count`：访问计数函数

详细 SQL 见 `supabase/rls.sql`。

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
