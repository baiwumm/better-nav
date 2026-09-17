/*
 * @Description: 表格行选择框（TanStack rowSelection 桥接）
 */
"use client";

import type { AppRow, AppTableFeatures } from "@/types/table-types";
import type { RowData, Table } from "@tanstack/react-table";

import { Checkbox } from "@heroui/react";
import { useCallback } from "react";

/**
 * 行选择 Checkbox 与 TanStack rowSelection 的桥接件。
 * 用法：在列定义中添加 select 列——
 *   header: ({ table }) => <DataTableSelectAll table={table} />
 *   cell: ({ row }) => <DataTableSelectRow row={row} />
 * 不启用 HeroUI Table 原生 selectionMode，选中状态完全由 TanStack rowSelection 驱动。
 */

/**
 * 列定义 header 上下文中的 table 为 TanStack core Table（不含 React 绑定层），
 * 故此处收窄为 core Table 类型；useTable 实例天然可赋值给 core Table。
 */
type SelectionTable<TData extends RowData> = Table<AppTableFeatures, TData>;

export function DataTableSelectAll<TData extends RowData>({
  table,
}: {
  table: SelectionTable<TData>;
}) {
  const allSelected = table.getIsAllRowsSelected();
  const someSelected = table.getIsSomeRowsSelected();

  const handleChange = useCallback(
    (checked: boolean) => table.toggleAllRowsSelected(checked),
    [table],
  );

  return (
    // HeroUI Table（react-aria）上下文内 Checkbox 必须声明 selection slot，
    // 否则运行时抛 "A slot prop is required. Valid slot names are 'selection'"。
    // RAC 会给表头的 selection checkbox 注入 isDisabled，导致全选永远点不动——显式传 false 覆盖。
    <Checkbox
      aria-label="全选"
      isDisabled={false}
      isIndeterminate={someSelected && !allSelected}
      isSelected={allSelected}
      slot="selection"
      onChange={handleChange}
    >
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  );
}

export function DataTableSelectRow<TData extends RowData>({
  row,
}: {
  row: AppRow<TData>;
}) {
  const handleChange = useCallback(
    (checked: boolean) => row.toggleSelected(checked),
    [row],
  );

  return (
    // 同上：Table 上下文内必须声明 selection slot；行内用 secondary 弱化样式
    <Checkbox
      aria-label="选择行"
      isDisabled={!row.getCanSelect()}
      isSelected={row.getIsSelected()}
      slot="selection"
      variant="secondary"
      onChange={handleChange}
    >
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Content>
    </Checkbox>
  );
}
