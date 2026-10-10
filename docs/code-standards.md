# 代码规范与质量门禁

> 拆分自 [AGENTS.md](../AGENTS.md)。写代码、补测试、提交前先读本文。

## Lint 规则

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

## TypeScript 规范

- 所有组件和工具函数必须使用 TypeScript
- 未使用的变量以 `_` 前缀命名（如 `_unused`）
- 优先使用 `AppTableFeatures`、`AppColumnDef` 等项目统一类型

## 单元测试

项目用 **Node 24 自带的 `node --test`**，不引入 jest/vitest。Node 24 可直接执行 `.ts`，
所以测试文件里 `import ... from "../src/lib/utils.ts"` 这类显式扩展名原生可解析
（`tsconfig.json` 里对应开了 `allowImportingTsExtensions`）。

因此当前**只能测纯函数**。涉及 React 渲染、hook 的用例需要 router context，
必须另配渲染器，本项目功能简单、暂不引入。

- `tests/sort.test.ts` — `sortWebsites` 四层排序优先级、非变异语义（防回归到原地 `.sort()`）
- `tests/utils.test.ts` — `formatBytes`（含越界收敛）、`get`、`responseMessage`、`formatDate`

新增测试放 `tests/*.test.ts`，`pnpm test` 自动发现，`pnpm lint` 会一并执行。

## Git 提交规范

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
