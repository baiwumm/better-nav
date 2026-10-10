# 已知技术欠账

> 拆分自 [AGENTS.md](../AGENTS.md)。评估优化、重构或代码审查前先读本文，避免重复评估；如需处理其中任何一项，先与人工确认。

记录在案、暂不处理的项：

| 欠账 | 说明 |
|------|------|
| `use-admin-table-page` 无测试 | 内部走 `useSwrQuery` → `@bprogress/next` 的 `useProgress`，需要 router context。覆盖它必须引入 vitest + testing-library + jsdom，已评估后决定不引（项目功能简单）。它是目前风险最集中的未覆盖代码，改动时需人工回归两个后台页面 |
| `react-aria` 在 store 中有 4 份副本 | 来源是 devDependency 链（`eslint-plugin-jsx-a11y` → `@adobe/react-spectrum`），与根依赖是否显式声明无关，删掉也减不了副本。不影响生产包 |
| 首页 `force-dynamic` + 全量数据下推客户端 | 曾用 `content-visibility` 缓解渲染成本，但其隐含的绘制遏制（`contain: paint`）会裁掉卡片悬停位移与阴影，已移除。当前 8 分类 / 72 站点，数据量未到需要分页的规模 |
| 13 处匿名函数 props | 违反 AGENTS.md「性能第一」守则，属洁癖项，逐个改性价比低 |
| `formatBytes` 输出无空格 | 拼接为 `"1KB"` 而非 `"1 KB"`，属既有输出格式，改动会牵动所有引用处文案 |
