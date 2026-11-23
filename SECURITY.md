# 安全策略

## 支持的版本

只维护最新发布版本。旧版本的问题请先升级到最新版再复现。

## 报告漏洞

**不要在公开 issue 或 discussion 中披露漏洞细节。**

请使用 GitHub 私密漏洞报告：

<https://github.com/baiwumm/better-nav/security/advisories/new>

报告里请包含：受影响的版本或提交、复现步骤、影响范围（能否读写他人数据、是否需要登录），以及你建议的修复方向。收到后会尽快确认，并在修复发布后于 advisory 中公开致谢。

## 重点关注的范围

- 认证与会话：`src/lib/supabase/` 下的验签、`requireUser`、未登录重定向
- 写接口鉴权：`src/app/api/` 是否在写操作前校验登录
- 行级安全：`supabase/schema.sql` 的 RLS 策略能否被绕过
- 存储桶：`logos` 桶的读写策略是否越权
- 匿名可读列：`email` / `user_id` 是否被意外下发

## 不在范围内

- Supabase 平台自身的漏洞（请报告给 Supabase）
- 依赖库自身的漏洞（由 Dependabot 与 CodeQL 跟踪；也可直接提 issue）
- 需要物理接触或已获得设备控制权才能利用的问题

## 请不要附带真实密钥

报告与截图里不要出现 Supabase secret key、`.env` 内容或任何登录凭据。需要演示时请用伪造值。
