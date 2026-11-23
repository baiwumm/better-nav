# 已知技术欠账

> 拆分自 [AGENTS.md](../AGENTS.md)。评估优化、重构或代码审查前先读本文，避免重复评估；如需处理其中任何一项，先与人工确认。

记录在案、暂不处理的项：

| 欠账 | 说明 |
|------|------|
| `use-admin-table-page` 无测试 | 内部走 `useSwrQuery` → `@bprogress/next` 的 `useProgress`，需要 router context。覆盖它必须引入 vitest + testing-library + jsdom，已评估后决定不引（项目功能简单）。它是目前风险最集中的未覆盖代码，改动时需人工回归 `/admin` 里分类、站点两个列表 Tab |
| `react-aria` 在 node_modules 中有 4 份副本 | 来源是 devDependency 链（`eslint-plugin-jsx-a11y` → `@adobe/react-spectrum`），与根依赖是否显式声明无关，删掉也减不了副本。不影响生产包 |
| 首页全量数据下推客户端 | 首页已改为 ISR（`revalidate` + 写接口 `revalidatePath`），渲染成本仍在：8 分类 / 72 站点全量下发到客户端，数据量未到需要分页的规模。曾用 `content-visibility` 缓解渲染成本，但其隐含的绘制遏制（`contain: paint`）会裁掉卡片悬停位移与阴影，已移除 |
| 13 处匿名函数 props | 违反 `vercel-react-best-practices` 性能守则（存量代码，新代码仍须遵守），属洁癖项，逐个改性价比低 |
| `formatBytes` 输出无空格 | 拼接为 `"1KB"` 而非 `"1 KB"`，属既有输出格式，改动会牵动所有引用处文案 |
| 分类页使用 UUID 路径 | `/c/<id>` 直接复用 `ds_categorys.id`，可被收录但 URL 不可读。换 slug 需要给线上库加列 + 唯一索引 + anon 列授权，还要同步 `PUBLIC_CATEGORY_FIELDS` 与后台表单，暂缓 |
| 分类页缺独有导语 | `ds_categorys.desc` 是半接通状态：表里有列、`/api` 的 INSERT 白名单也有，但 anon 列授权、`PUBLIC_CATEGORY_FIELDS` 与后台表单都没接。不补的话 8 个分类页只是首页子集，内容偏薄 |
| `llms.txt` 收益不可验证 | 只对会解析机器可读清单的引擎有意义，Google 官方明确说不需要。保持输出正确即可，不要围绕它做优化 |
