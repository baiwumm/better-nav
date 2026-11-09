<div align="center">
  <img alt="Better Nav logo" src="./public/logo.svg" width="80" />
  <h1>Better Nav</h1>
  <p>一个把常用网址收拾得干干净净的小站。</p>
</div>

<div align="center">
  <a href="https://nav.baiwumm.com/" target="_blank">
    <img alt="Preview" src="https://img.shields.io/badge/在线预览-nav.baiwumm.com-black?style=flat" />
  </a>
  <a href="https://nextjs.org/" target="_blank">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" />
  </a>
  <a href="https://www.heroui.com/" target="_blank">
    <img alt="HeroUI" src="https://img.shields.io/badge/HeroUI-v3-black?style=flat" />
  </a>
  <a href="https://supabase.com/" target="_blank">
    <img alt="Supabase" src="https://img.shields.io/badge/Supabase-black?style=flat&logo=supabase" />
  </a>
  <a href="./LICENSE" target="_blank">
    <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue?style=flat" />
  </a>
</div>

<div align="center">
  <img alt="Better Nav —— 把常用网址收拾得干干净净" src="./public/cover.webp" width="1200" />
</div>

## 🌱 简介

`Better Nav` 是一个基于 Next.js 与 Supabase 的个人导航站。

它专注做一件小事：把常用网址放在一起，打开就能用。支持亮暗主题、响应式布局、基础 SEO，以及登录后的网站分类与管理。

## 🌿 截图

| 亮色模式 | 暗色模式 |
| --- | --- |
| ![亮色模式](./public/light.png) | ![暗色模式](./public/dark.png) |

| 分类管理 | 站点列表 |
| --- | --- |
| ![分类列表](./public/categorys.png) | ![站点列表](./public/websites.png) |

## ☘️ 技术栈

- Next.js 16 + React 19
- HeroUI v3
- Tailwind CSS v4
- Supabase
- Vercel

## 🪴 本地开发

### 🌱 环境要求

- Node.js >= 20.9（Next.js 16 最低要求）；本地开发用 Node 24 —— `pnpm lint` 内含的 `pnpm test` 依赖 `node --test` 直接执行 `.ts`
- pnpm（版本由 package.json 的 `packageManager` 字段锁定）

### 🌵 启动项目

```bash
git clone https://github.com/baiwumm/better-nav.git
cd better-nav
pnpm install
pnpm dev
```

先将 `.env.example` 复制为 `.env.local`，再补全你自己的环境变量。

默认访问：`http://localhost:3000`

## 🌼 环境变量

```bash
# 必需
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=logos

# 站点信息与统计（可选，留空则不渲染对应区块）
NEXT_PUBLIC_APP_NAME=Better Nav
NEXT_PUBLIC_APP_TITLE=一个把常用网址收拾得干干净净的小站
NEXT_PUBLIC_APP_DESC=把常用网址放在一起，打开就能用。
NEXT_PUBLIC_APP_KEYWORDS=Better Nav,常用网站,网站入口,工具入口
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ICP=
NEXT_PUBLIC_GUAN_ICP=
NEXT_PUBLIC_GOOGLE_ID=
NEXT_PUBLIC_CLARITY_ID=
```

复制 [`.env.example`](./.env.example) 为 `.env.local` 后填写。作者昵称、bio、头像不走环境变量，运行时从 GitHub 账户自动拉取。

## 🍀 Supabase 与部署

完整步骤（验证清单、故障排查、可直接复制给 Agent 的指令）见 **[docs/supabase-deployment.md](./docs/supabase-deployment.md)**。最短路径：

1. 建 Supabase 项目，把 Project URL 与 publishable key 填进 `.env.local`
2. SQL Editor 整段执行 [`supabase/schema.sql`](./supabase/schema.sql)；想先看效果再跑 [`supabase/seed.sql`](./supabase/seed.sql)
3. Authentication：关闭 *Allow new users to sign up*；Redirect URLs 加 `https://<你的域名>/auth/callback` 与 `http://localhost:3000/auth/callback`（已配 `/**` 通配则无需重复加）
4. Authentication → Users → **Add user** 建账号（密码 6–12 位，含大小写字母和数字）

> ⚠️ 写权限是「已登录即可写」，**必须关闭公开注册**，否则谁注册都能改库。
> ⚠️ `schema.sql` 面向全新项目：第 4 段会 DROP 并重建两张表的全部 RLS 策略，已有线上库不要整段跑。

密钥填好后，SQL 生成、策略核对、本地验证都能交给 Agent，提示词见部署手册第 3 节。

## 🌲 部署

推荐 Vercel：fork → 导入仓库 → 配好上面三个必需环境变量 → Deploy。

绑定域名后记得把 `NEXT_PUBLIC_APP_URL` 改成生产域名并重新部署（`NEXT_PUBLIC_*` 构建期内联），再到 Supabase 补上生产域名的 Redirect URL。

## 🌸 许可证

[MIT](./LICENSE) © [baiwumm](https://baiwumm.com)
