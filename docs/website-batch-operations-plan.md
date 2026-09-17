# 网站列表批量操作实施计划（多选 + 批量移动分类 / 批量删除）

> 状态：方案已评估并经用户确认（2026-09-16），待实施。
> 范围：仅后台「网站列表」，分类管理不改动。不改数据库、不改 RLS。

---

## 1. 背景与目标

后台网站列表数据多时，删除、改分类只能逐行操作。目标：

1. 表格首列增加多选框（表头全选 + 行选）；
2. 选中后底部浮现「批量操作栏」，支持：**批量移动到指定分类**、**批量删除**；
3. 单条操作（编辑/删除）与分类管理页行为完全不变。

## 2. 可行性结论（已核实）

| 前提 | 结论 |
| --- | --- |
| TanStack Table 9.2.4 | 自带 `rowSelectionFeature`，`getSelectedRowModel / toggleAllRowsSelected / resetRowSelection / enableRowSelection / getIsSomeRowsSelected` 全部可用 |
| HeroUI v3 Table | 官方支持 Table 上下文内 `Checkbox slot="selection"` 桥接；better-admin 已踩平两个坑（见 §5.2） |
| RLS | `ds_websites_admin_write` 为 `FOR ALL` 策略，`.update().in("id", ids)` / `.delete().in("id", ids)` 直接适用，无需改 SQL |
| SWR | `buildMutationFetcher` 的 DELETE 固定拼 `/${id}`，批量接口必须用 **POST + data** 传参 |
| 参考实现 | `better-admin/apps/next/src/features/users/users-page.tsx` 的 `DataTableBulkActions` 用法 + `data-table-select-cell.tsx` |

## 3. 已拍板的决策

1. **允许修改 `src/types/table-types.ts`**：在其 `appTableFeatures` 中增量追加 `rowSelectionFeature`（用户已批准此一处例外；纯增量，不传 `enableRowSelection` 的页面无任何行为变化）。
2. **批量移动不二次确认**：选分类 + 点「移动」即为确认动作（可逆操作）；批量删除保留确认弹窗。

## 4. 非目标

- 跨页全选 / 按筛选条件全量操作（需按条件批量接口，风险高，本期不做）；全选 = 当前页全选。
- 网站分类列表的批量操作。
- 删光末页后 `pageIndex` 越界的修复（现有单删同样存在，不属本期范围）。

---

## 5. 变更清单

新增 3 个文件、修改 5 个文件。实施时遵守 AGENTS.md（HeroUI-only / Tailwind / SWR / vercel-react-best-practices / 组件目录 `index.tsx`）。

### 5.1 新增 `src/app/api/websites/batch/route.ts`（POST）

请求体判别联合：

```ts
type WebsiteBatchParams =
  | { action: "delete"; ids: string[] }
  | { action: "moveCategory"; ids: string[]; category_id: string };
```

处理流程：

1. `requireAdmin()` 鉴权，失败返回 401「未登录或无权限」（与现有接口一致）；
2. 校验 `ids` 为非空字符串数组、去重、上限 1000，否则「参数错误」；
3. `action === "moveCategory"`：单条 `supabase.from("ds_websites").update({ category_id }).in("id", ids).select("id")`，原子；分类不存在由外键约束报错兜底；
4. `action === "delete"`：复刻 `[id]/route.ts` 单删顺序——
   - 逐 id `storage.list(\`${uid}/${id}\`)` 收集 logo 路径（任一 list 失败即整体中止，DB 零影响）；
   - 合并所有路径一次性 `storage.remove(paths)`（失败中止）；
   - `delete().in("id", ids).select("id")`；
5. 成功返回 `responseMessage({ count: n })`，`n` 为 DB 实际影响条数（并发被他人删除的行不计入）。

### 5.2 新增 `src/components/DataTableSelect/index.tsx`

移植 better-admin 的 `DataTableSelectAll / DataTableSelectRow`（参照其 `data-table-select-cell.tsx`），要点：

- Table 上下文内 Checkbox **必须** `slot="selection"`，否则运行时抛错；
- 表头全选框显式 `isDisabled={false}`（覆盖 react-aria 注入的禁用）；
- 全选框 `isIndeterminate={someSelected && !allSelected}`；行内 `variant="secondary"`；
- 不启用 HeroUI Table 原生 `selectionMode`（保留行内交互，状态由 TanStack `rowSelection` 驱动）；
- 本项目无 i18n，aria-label 写死「全选 / 选择行」。

### 5.3 新增 `src/components/DataTableBulkActions/index.tsx`

移植 better-admin 的 `data-table-bulk-actions.tsx`（悬浮胶囊条）：

- `selectedCount > 0` 时固定 `fixed inset-x-0 bottom-6 z-40` 居中显示；自底部淡入上滑进出场（`duration-200`，`motion-reduce:transition-none`），退场延时 200ms 再卸载；
- 结构：计数 Chip | 操作插槽（children）| 清空按钮（X）；`aria-live="polite"`；
- Esc 键清空选择（仅选中时监听，直接 `useEffect` 挂 keydown，不需要 better-admin 的自定义 hook）；
- 通用泛型 `{ table: AppTable<TData>; children?: ReactNode; className?: string }`。

### 5.4 修改 `src/types/table-types.ts`（已获准）

`appTableFeatures` 增量追加 `rowSelectionFeature`（对齐 better-admin 同名文件写法）。不新增 row model（selection 的 `getSelectedRowModel` 由 feature 自带）。

### 5.5 修改 `websites/components/columns.tsx`

在「序号」列前新增 `select` 展示列：

```ts
columnHelper.display({
  id: "select",
  enableSorting: false,
  enableHiding: false,
  header: ({ table }) => <DataTableSelectAll table={table} />,
  cell: ({ row }) => <DataTableSelectRow row={row} />,
})
```

`enableHiding: false` 保证 `ColumnsVisibility`（按 `getCanHide()` 过滤）不显示该项。`data-table.tsx` 无需改动。

### 5.6 新增 `websites/components/bulk-actions.tsx`（页面级组合）

往通用悬浮条 children 中放：分类 `Select`（写法复用 `header-content.tsx` 的 `Select + ListBox`，数据用已有的 `categorysList`）、「移动」按钮（未选分类时禁用）、「删除」按钮（`variant="danger-soft"`）。小屏防溢出：容器 `max-w-[calc(100vw-2rem)] flex-wrap`。Props：`table / categorysList / handleBatchMove(categoryId) / handleBatchDelete()`。

### 5.7 修改 `websites/components/delete-dialog.tsx`

新增可选 `count?: number`：有值时标题为「确认删除选中的 N 个网站？」，无值保持原文案（单删零改动）。批量删除复用该弹窗，不新建。

### 5.8 修改 `websites/index.tsx`（接线）

- 新增 `const [rowSelection, setRowSelection] = useState<RowSelectionState>({})`；`useTable` 增加 `enableRowSelection: true`、`state.rowSelection`、`onRowSelectionChange`；
- `selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)`；
- 新增 `useSwrMutation("/websites/batch", "POST")`，两操作共用；触发前用 ref 记录 action，`onSuccess`（`code === RESPONSE.SUCCESS`）：toast「已移动 N 个网站到「分类名」/ 已删除 N 个网站」（N 用接口返回的真实条数）→ `mutate()` 刷新 → `table.resetRowSelection()`；
- 删除确认：单删 `setDelCount(undefined)`，批删 `setDelCount(selectedIds.length)`；`handleDelConfirm` 按有无 `delCount` 分流单删/批删；
- **翻页/搜索/重置（即 `query` 变化）时 `useEffect` 调用 `table.resetRowSelection()`**，避免隐藏页残留勾选；
- 渲染 `<BulkActions />` 与改造后的 `<DeleteDialog count={delCount} />`。

---

## 6. 交互与边界

| 场景 | 行为 |
| --- | --- |
| 全选 | 仅当前页（服务端分页，`data` 只含本页） |
| 翻页 / 搜索 / 重置 | 清空勾选 |
| 清空勾选（含移动成功 / Esc / 清空按钮） | 同步清空操作栏中未提交的目标分类，下次唤起不残留 |
| 批量移动 | 不二次确认；toast 报真实条数；移错可再移回 |
| 批量删除 | 弹窗确认（标题含数量）；logo 文件与 DB 记录同现有单删口径清理 |
| 并发冲突 | `.in()` 只影响仍存在的行，toast 用实际影响数 |
| 其他页面 | 未启用 `enableRowSelection`，无任何变化 |

## 7. 质量门禁

- `pnpm lint`、`pnpm build` 零错误；
- 遵循 vercel-react-best-practices（`useCallback`/`useMemo`、稳定 props）；
- UI 全部 HeroUI（Select/Button/Checkbox/AlertDialog），禁止 div+CSS 模拟；
- 不改 `src/lib/supabase/*`、`eslint.config.mjs`、`next.config.ts`；不涉及 SQL 变更。

## 8. 冒烟测试方案（通过标准）

**静态**：`pnpm lint`、`pnpm build` 通过。

**API 负例（无需登录）**：未携带登录态 `POST /api/websites/batch` 返回 401；缺 `ids` 返回「参数错误」。

**UI 冒烟（需登录后台，凭据可用时执行；不可用则在报告中列为阻塞项）**：

1. 列表首列出现复选框；表头全选/半选状态正确；
2. 勾选 N 行 → 底部悬浮条出现并显示 N；Esc 与 X 均可清空；
3. 翻页后勾选被清空；
4. 批量移动：选分类 → 移动 → toast 显示真实条数 → 列表刷新、分类 Chip 更新、悬浮条消失；
5. 批量删除：弹窗标题含数量 → 确认 → toast → 总条数减少、行消失；抽查 Supabase Storage 对应 `${uid}/${siteId}` 目录已清理；
6. 回归：单条编辑/删除正常；分类管理页、首页均不受影响；「列设置」中无 select 项；
7. （可选）375px 视口下悬浮条不溢出。

**通过标准**：以上全部通过且 lint/build 零错误；凭据缺失时，明确列出未能覆盖的用例。

## 9. 回滚

纯增量改动，`git checkout -- .` 即可整体回滚，无数据迁移。
