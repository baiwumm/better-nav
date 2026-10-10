/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-10-09 10:00:00
 * @Description: 后台列表页顶部区域（查询 / 重置 / 新增 + 列可见性，分类列表与网站列表共用）
 */
"use client";
import type { Category } from "@/types";
import type { AppTable } from "@/types/table-types";
import type { Dispatch, KeyboardEvent, SetStateAction } from "react";
import type { RowData } from "@tanstack/react-table";

import { ArrowRotateLeft, Magnifier, Plus } from "@gravity-ui/icons";
import {
  Button,
  Card,
  ListBox,
  SearchField,
  Select,
  Spinner,
} from "@heroui/react";

import ColumnsVisibility from "@/components/ColumnsVisibility";

interface AdminHeaderContentProps<TData extends RowData> {
  table: AppTable<TData>;
  /** 搜索框的无障碍名称与占位符，如「分类名称」「网站名称」 */
  namePlaceholder: string;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  loading?: boolean;
  handleSearch: VoidFunction;
  handleReset: VoidFunction;
  handleAdd: VoidFunction;
  /** 传入 setCategoryId 时额外渲染「所属分类」筛选下拉（仅网站列表需要） */
  categorysList?: Category[];
  categoryId?: string;
  setCategoryId?: Dispatch<SetStateAction<string>>;
}

function AdminHeaderContent<TData extends RowData>({
  table,
  namePlaceholder,
  name,
  setName,
  loading = false,
  handleSearch,
  handleReset,
  handleAdd,
  categorysList = [],
  categoryId,
  setCategoryId,
}: AdminHeaderContentProps<TData>) {
  // 回车事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Card.Header className="flex justify-between items-start w-full flex-col sm:flex-row sm:items-center gap-2">
      <Card.Title className="flex items-center gap-2 flex-wrap">
        <SearchField
          aria-label={namePlaceholder}
          value={name}
          variant="secondary"
          onChange={setName}
          onKeyDown={handleKeyDown}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-50" placeholder={namePlaceholder} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        {setCategoryId ? (
          <Select
            aria-label="所属分类"
            className="w-60"
            placeholder="所属分类"
            value={categoryId || null}
            variant="secondary"
            onChange={(id) => setCategoryId(id as string)}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.ClearButton />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {categorysList?.map(({ id, name }) => (
                  <ListBox.Item key={id} id={id} textValue={name}>
                    {name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : null}
        <Button isPending={loading} size="sm" onPress={handleSearch}>
          {({ isPending }) => (
            <>
              {isPending ? (
                <Spinner color="current" size="sm" />
              ) : (
                <Magnifier />
              )}
              查询
            </>
          )}
        </Button>
        <Button
          isDisabled={loading}
          size="sm"
          variant="secondary"
          onPress={handleReset}
        >
          <ArrowRotateLeft />
          重置
        </Button>
        <Button size="sm" variant="outline" onPress={handleAdd}>
          <Plus />
          新增
        </Button>
      </Card.Title>
      <ColumnsVisibility table={table} />
    </Card.Header>
  );
}

export default AdminHeaderContent;
