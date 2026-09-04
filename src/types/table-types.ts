"use client";

import type {
  ColumnDef,
  ReactTable,
  Row,
  RowData,
} from "@tanstack/react-table";

import {
  columnOrderingFeature,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * 项目统一的 TanStack Table v9 feature 集（模块级静态注册，tree-shaking 友好）：
 * 列可见性/列排序 + 行排序 + 分页。
 */
export const appTableFeatures = tableFeatures({
  columnOrderingFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

/** 列定义类型（业务页 columns 声明用） */
export type AppColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  AppTableFeatures,
  TData,
  TValue
>;

/** 行类型（cell/header 渲染 props 与行选择桥接用） */
export type AppRow<TData extends RowData> = Row<AppTableFeatures, TData>;

/**
 * 列表页表格实例类型（v9 原生 API）。
 */
export type AppTable<TData extends RowData> = ReactTable<
  AppTableFeatures,
  TData
>;

export type AppTableFeatures = typeof appTableFeatures;
