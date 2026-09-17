/*
 * @Description: 网站列表批量操作栏（批量移动分类 / 批量删除）
 */
"use client";

import type { Category, Website } from "@/types";
import type { AppTable } from "@/types/table-types";
import type { Key } from "@heroui/react";
import type { FC } from "react";

import { ArrowRightToSquare, TrashBin } from "@gravity-ui/icons";
import { Button, ListBox, Select } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

import DataTableBulkActions from "@/components/DataTableBulkActions";

interface BulkActionsProps {
  table: AppTable<Website>;
  categorysList: Category[];
  loading: boolean;
  handleBatchMove: (categoryId: string) => void;
  handleBatchDelete: VoidFunction;
}

const BulkActions: FC<BulkActionsProps> = ({
  table,
  categorysList = [],
  loading = false,
  handleBatchMove,
  handleBatchDelete,
}) => {
  // 目标分类：仅本组件内部使用，移动成功后父级清空勾选，悬浮条随之隐藏
  const [categoryId, setCategoryId] = useState("");
  // 行选中状态（父级受控 rowSelection，变化时会带动本组件重渲染）
  const hasSelection = table.getSelectedRowModel().rows.length > 0;

  // 清空勾选时（移动成功 / Esc / 清空按钮 / 翻页搜索）同步清掉未提交的目标分类，避免下次唤起时残留
  useEffect(() => {
    if (!hasSelection) setCategoryId("");
  }, [hasSelection]);

  const handleCategoryChange = useCallback((value: Key | Key[] | null) => {
    setCategoryId(typeof value === "string" ? value : "");
  }, []);

  const handleMove = useCallback(() => {
    if (categoryId) handleBatchMove(categoryId);
  }, [categoryId, handleBatchMove]);

  return (
    <DataTableBulkActions table={table}>
      <Select
        aria-label="移动到分类"
        className="w-45"
        placeholder="移动到分类"
        value={categoryId || null}
        variant="secondary"
        onChange={handleCategoryChange}
      >
        <Select.Trigger>
          <Select.Value />
          <Select.ClearButton />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {categorysList.map(({ id, name }) => (
              <ListBox.Item key={id} id={id} textValue={name}>
                {name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <Button
        className="text-xs"
        isDisabled={!categoryId}
        isPending={loading}
        size="sm"
        variant="ghost"
        onPress={handleMove}
      >
        <ArrowRightToSquare />
        移动
      </Button>
      <Button
        className="text-xs text-danger hover:bg-danger-soft"
        isDisabled={loading}
        size="sm"
        variant="ghost"
        onPress={handleBatchDelete}
      >
        <TrashBin />
        删除
      </Button>
    </DataTableBulkActions>
  );
};

export default BulkActions;
