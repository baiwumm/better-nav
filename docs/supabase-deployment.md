# Supabase 部署与 Agent 操作手册

> 面向「人工 + Agent 协作」的部署流程：人工只做不可外包的两件事（建项目、填密钥），
> 其余 SQL 执行、策略核对、链路验证都可以交给 Agent。
> 表结构与 RLS 模型见 [database.md](./database.md)，环境变量语义见 [tech-stack.md](./tech-stack.md)。

## 1. 分工

| 角色 | 负责 |
|------|------|
| 人工 | 建 Supabase 项目；填 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`；在 Dashboard 建登录账号；配置 OAuth 应用（可选）；Vercel 绑定域名 |
| Agent | 生成并校验初始化 / 增量 SQL；核对 RLS 与存储桶策略；跑 `pnpm install && pnpm lint`；按第 4 节验证清单逐条跑通并给出排错建议 |

密钥配好后，把 [第 3 节](#3-交给-agent)的提示词原样交给 Agent 即可，它会自己读仓库里的 `supabase/*.sql` 与 `docs/*.md`。

## 2. 人工准备（约 5 分钟）

### 2.1 取连接信息

Project Settings → API：复制 **Project URL** 与 **publishable key**（`sb_publishable_...`）。

> 前端只允许用 publishable key。`SUPABASE_SECRET_KEY` / `service_role` 属于本地运维密钥，不进 `.env.example`、不配到 Vercel（见 [tech-stack.md](./tech-stack.md)）。

### 2.2 关闭公开注册（不可省略）

Authentication → Sign In / Providers → **Email** → 取消勾选 *Allow new users to sign up*。

写权限模型是「已登录即可写」，注册一旦打开，任何人注册后都能改库。

### 2.3 配置 OAuth 回跳（用 GitHub / Google 登录时必做）

- Authentication → URL Configuration → **Site URL**：生产域名
- **Redirect URLs**：生产加 `https://<你的域名>/auth/callback`、本地加 `http://localhost:3000/auth/callback`
  - 已经用通配 `https://<你的域名>/**` / `http://localhost:3000/**` 的可以不重复加：`**` 会跨 `/` 匹配，已覆盖 `/auth/callback`
  - 通配留给 Vercel preview 域名用；Supabase 建议生产环境用精确路径，不要只靠 `/**`
- 启用 GitHub / Google 时，还要在各自开放平台建 OAuth App，回调地址填 `https://<project-ref>.supabase.co/auth/v1/callback`（由 Supabase 中转，不是站点域名）
- 回跳路径固定为 `/auth/callback`（`src/app/auth/callback/route.ts`：用 code 换 session，成功回首页，失败跳 `/login?error=<code>`）
- 少配 Redirect URLs 的表现：OAuth 登录后落回 Site URL，页面上没有任何提示

### 2.4 建账号

Authentication → Users → **Add user**（邮箱 + 密码）。登录页没有注册入口。

- 密码建议 6–12 位且同时含大小写字母和数字 —— 登录页表单就是这个校验规则，不符合会提交不了
- 想让它能用 GitHub / Google 登录：先用同一邮箱在这里建号，第三方账号首次登录会自动关联；没建号就 OAuth 登录会拿到 `signup_disabled`，登录页提示「本站注册已关闭」

## 3. 交给 Agent

### 3.1 首次部署

把下面这段连同占位信息一起发给 Agent：

```text
你是 Better Nav 仓库的部署 Agent。人工已完成：
- Supabase 项目已建好
- NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 已写入 .env.local（不要读取或回显它们的值）
- 控制台侧已关闭公开注册、已把 /auth/callback 纳入 Redirect URLs（精确路径或 /** 通配都算）、已用 Add user 建好登录账号

按顺序执行，每步用一两句话汇报结果；命中「禁止」清单时停下来问我：

1. 读 supabase/schema.sql、supabase/seed.sql、docs/database.md，判断本次要执行的语句范围：
   - 全新库：整份 schema.sql，再决定是否跑 seed.sql
   - 已有数据的库：不要整跑 schema.sql（第 4 段会 DROP 全部 RLS 策略），只取需要的段落或新写增量 SQL
2. 输出「SQL Editor 执行清单」：每个语句块建了什么、漏跑会怎样；整份脚本末尾的自检查询也一并给出
3. 核对 .env.example 与 .env.local 的变量名是否齐全一致（只报缺失项，不打印值）
4. 跑 pnpm install && pnpm lint，修到通过；文档、格式类问题可直接改，业务逻辑改动先问我
5. 按 docs/supabase-deployment.md 第 4 节「验证清单」在本地逐条验证，给出通过/失败结论与证据（命令、状态码、页面表现）
6. 汇总还需要我在 Supabase 控制台点的开关（例如注册未关、Redirect URLs 少了哪条）

禁止：
- 打开 Allow new users to sign up，或把 RLS 写策略放宽到 anon / public
- 修改 src/lib/supabase/*（认证安全核心，见 AGENTS.md 禁改清单）
- 把 sb_secret_ / service_role key 写进 NEXT_PUBLIC_* 或提交进仓库
- 对已有数据的线上库整段执行 supabase/schema.sql
```

### 3.2 表结构变更（已有线上库）

```text
需求：<一句话描述要改的表/字段/策略>

要求：
1. 先读 docs/database.md 与 supabase/schema.sql，保持脚本幂等（if not exists / drop policy if exists）
2. 不要改动「已登录即可写」模型，不要把 increment_visit_count 的 security definer 去掉
3. 只输出 delta SQL，并说明在已有数据上执行的影响与回滚方式；不要整段重写 schema.sql
4. 同步更新 docs/database.md 与前端类型，最后跑 pnpm lint
```

### 3.3 只生成 SQL，不落地

```text
按 docs/database.md 的现有模型，生成一份可在 Supabase SQL Editor 直接执行的脚本：
- 目标：<新库初始化 / 增量变更>
- 输出：完整 SQL + 每段的作用说明 + 执行顺序
- 附一条自检 SQL：列出 public 下两张表的 RLS 策略与 storage.objects 上的桶策略
- 不要执行，也不要改仓库文件
```

## 4. 验证清单

本地 `pnpm dev` 跑起来后按顺序确认：

| # | 检查 | 操作 | 预期 |
|---|------|------|------|
| 1 | 公开读 | 打开 `/` | 能看到分类与站点（跑过 seed 有 4 个分类） |
| 2 | 未登录拦截 | 访问 `/admin` | 重定向到 `/login` |
| 3 | 登录 | 用 Add user 的账号登录 | 登录成功回到首页；再进 `/admin` 不再被拦 |
| 4 | 写链路 | 后台新增分类、上传 Logo 新建站点 | 两步都成功，无 RLS 报错 |
| 5 | 访问计数 | 回首页点一次站点卡片 | 后台该站点 `visitCount` +1 |
| 6 | 匿名写 API | `Invoke-WebRequest -Method Post http://localhost:3000/api/websites -Body '{}' -ContentType application/json` | 401「未登录或无权限」 |
| 7 | 匿名写表 | 带 publishable key（`apikey` + `Authorization: Bearer`）`POST {URL}/rest/v1/ds_websites` | 401 |
| 8 | 未受邀 OAuth | 用没在 Users 里建过的 GitHub / Google 账号登录 | 登录页提示「本站注册已关闭，仅限受邀账号登录。」 |
| 9 | OG 图 | 打开 `/opengraph-image` | 返回 PNG，含站点信息与 GitHub 头像 |

> 不要用「不存在的 id」测 UPDATE / DELETE 判断 RLS：PostgreSQL 对不存在的行一律返回 0 行成功，RLS 根本不会被评估。可靠信号是匿名 INSERT 返回 401、对真实行 UPDATE 返回 0 行。
>
> `schema.sql` 末尾附了自检查询（表结构、RLS 策略、函数标记、存储桶），可直接在 SQL Editor 里单独执行。

## 5. 执行 SQL

| 场景 | 做法 |
|------|------|
| 全新项目 | SQL Editor 粘贴 [`supabase/schema.sql`](../supabase/schema.sql) 全文，Run |
| 想要演示数据 | 再整段执行 [`supabase/seed.sql`](../supabase/seed.sql)；幂等，文件末尾附清理语句 |
| 已有数据的线上库 | **不要整段跑 schema.sql**：第 4 段会 DROP 并重建两张表上的全部 RLS 策略。只执行增量语句，或让 Agent 按 3.2 出 delta SQL |
| 本地直连 | `psql "$DATABASE_URL" -f supabase/schema.sql` |

注意事项：

- 脚本结尾带 `notify pgrst, 'reload schema';`，漏了会报 `Could not find the table 'public.ds_websites' in the schema cache`
- 中途失败会让表停在「无任何策略」状态，连公开读都会被拒；重跑全文即可恢复
- 策略是 OR 合并语义：残留的旧宽松策略会让新限制失效，所以脚本先清空再重建（不要手工跳步）
- 从旧版本升级的线上库：单独执行 `schema.sql` 第 3 段（访问计数函数，已内置 `drop`，可覆盖旧的随机计数与双参重载）和第 6 段（匿名列级授权），再执行 `notify pgrst, 'reload schema';`

## 6. 部署到 Vercel

1. Fork 本仓库 → Vercel 导入
2. 配置环境变量：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`，站点名 / 描述 / 备案 / 统计 ID 按需
3. Deploy
4. 绑定域名后把 `NEXT_PUBLIC_APP_URL` 改成生产域名并**重新部署**（`NEXT_PUBLIC_*` 构建期内联，改完不重新部署不生效；它决定 sitemap / robots / OG 图里的绝对地址）
5. 回 Supabase 补上生产域名的 Redirect URL

发版流水线 `.github/workflows/release.yml`（GitHub Actions，Node 24）先跑 `pnpm lint` 与 `pnpm build`，再交给 release-it 打 tag。它需要仓库 Secrets：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`（仅 Build 步骤使用）。

## 7. 故障排查

| 现象 | 原因与解法 |
|------|------|
| `Could not find the table 'public.ds_websites' in the schema cache` | PostgREST 缓存没刷新。重跑 `notify pgrst, 'reload schema';`，或等 Dashboard 的 API 页自动重载 |
| 登录后进 `/admin` 被弹回登录页 | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 填错，或改了 `.env` 没重启 dev server |
| 能进后台但保存报 401 | `schema.sql` 第 4 段 RLS 策略没执行完，数据库层把写操作挡了 |
| OAuth 登录后回到首页、没有提示 | Redirect URLs 少了 `/auth/callback`，Supabase 回退到 Site URL |
| OAuth 登录提示「本站注册已关闭」 | 这个第三方账号的邮箱没有先在 Dashboard 的 Users 里建号 |
| 登录按钮提交不了、密码标红 | 登录页表单要求 6–12 位且含大小写字母和数字 |
| 上传 Logo 报 `new row violates row-level security policy`（storage.objects） | 第 5 段桶策略没执行完，或 `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` 与桶名 `logos` 不一致 |
| 点卡片访问计数不涨 | `increment_visit_count` 不是 `security definer`，被 RLS 挡了。单独重跑 `schema.sql` 第 3 段（已内置 `drop`，可覆盖旧版随机计数 / 双参重载） |
| 生产环境 OG 图 / sitemap 指向旧域名 | `NEXT_PUBLIC_APP_URL` 没改，或改完没重新部署 |

## 8. 相关文档

- 表结构、RLS 模型与改动约束：[docs/database.md](./database.md)
- 环境变量与站点常量：[docs/tech-stack.md](./tech-stack.md)
- 已废弃的邮箱白名单方案（历史记录）：[supabase/auth-migration-guide.md](../supabase/auth-migration-guide.md)
