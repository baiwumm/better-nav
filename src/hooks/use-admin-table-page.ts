/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-10-09 10:00:00
 * @Description: 后台列表页状态机（分页 / 排序 / 列可见性 / 行选择 / 查询防抖去重，分类列表与网站列表共用）
 */
"use client";
import type { PaginatingResponse } from "@/types";
import type { AppColumnDef, AppTable } from "@/types/table-types";
import type {
  ColumnVisibilityState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";

import { useTable } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSwrQuery } from "@/hooks/use-swr";
import { appTableFeatures } from "@/types/table-types";
import { get } from "@/lib/utils";

/** 列表页默认分页 */
const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

export interface AdminTablePageOptions<TData extends RowData> {
  /** 列表接口路径，如 "/categorys" */
  endpoint: string;
  /** 业务搜索字段（不含分页）。调用方需自行 useMemo，否则每次渲染都是新对象 */
  filters: Record<string, unknown>;
  /** 重置时 filters 的初始值，建议用模块级常量 */
  initialFilters: Record<string, unknown>;
  /** 初始列可见性 */
  initialColumnVisibility?: ColumnVisibilityState;
  /** 列工厂，page/pageSize 供序号列计算；依赖需由调用方自行 memo 化 */
  buildColumns: (ctx: {
    page: number;
    pageSize: number;
  }) => AppColumnDef<TData>[];
  getRowId: (row: TData) => string;
  /** 是否开启行选择（有批量操作的页面传 true） */
  enableRowSelection?: boolean;
}

export interface AdminTablePage<TData extends RowData> {
  data: PaginatingResponse<TData> | undefined;
  loading: boolean;
  list: TData[];
  total: number;
  table: AppTable<TData>;
  /** 当前页码与每页条数，供列工厂使用 */
  page: number;
  pageSize: number;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  /** 点击查询：参数有变化则更新 key 发起新请求；无变化则强制重新验证（保持“点击查询即刷新”） */
  handleSearch: VoidFunction;
  /** 重置查询条件回到初始值并跳回第一页（输入控件由调用方自行清空） */
  resetQuery: VoidFunction;
  /** 增删改成功后强制刷新当前列表（绕过去重缓存） */
  handleRefresh: VoidFunction;
}

export function useAdminTablePage<TData extends RowData>({
  endpoint,
  filters,
  initialFilters,
  initialColumnVisibility,
  buildColumns,
  getRowId,
  enableRowSelection = false,
}: AdminTablePageOptions<TData>): AdminTablePage<TData> {
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);
  // 排序
  const [sorting, setSorting] = useState<SortingState>([]);
  // 受控列
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(initialColumnVisibility ?? {});
  // 行选择（受控，仅当前页；翻页/搜索/重置时清空）
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const searchParams = useMemo(
    () => ({ ...filters, ...pagination }),
    [filters, pagination],
  );
  const [query, setQuery] = useState(searchParams);
  const { data, loading, mutate } = useSwrQuery<PaginatingResponse<TData>>(
    [endpoint, query],
    { keepPreviousData: true },
  );

  const total = useMemo(() => data?.total ?? 0, [data]);
  const list = useMemo(() => data?.list ?? [], [data]);

  const searchParamsRef = useRef(searchParams);
  const queryRef = useRef(query);
  const initialFiltersRef = useRef(initialFilters);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    initialFiltersRef.current = initialFilters;
  }, [initialFilters]);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleSearch = useCallback(() => {
    const next = searchParamsRef.current;

    if (JSON.stringify(next) === JSON.stringify(queryRef.current)) {
      mutate();
    } else {
      setQuery(next);
    }
  }, [mutate]);

  const resetQuery = useCallback(() => {
    setPagination(DEFAULT_PAGINATION);
    setQuery({ ...initialFiltersRef.current, ...DEFAULT_PAGINATION });
  }, []);

  const page = get(data, "page", 0) as number;
  const pageSize = get(data, "pageSize", 0) as number;

  // 列配置项
  const columns = useMemo(
    () => buildColumns({ page, pageSize }),
    [buildColumns, data],
  );

  // 表格实例
  const table = useTable({
    data: list,
    columns,
    features: appTableFeatures,
    pageCount: Math.ceil((total || 0) / pagination.pageSize),
    getRowId,
    enableRowSelection,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  // 分页变化自动查询
  useEffect(() => {
    setQuery((q) => ({
      ...q,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }));
  }, [pagination.pageIndex, pagination.pageSize]);

  // 翻页 / 搜索 / 重置后清空勾选，避免隐藏页残留选中项
  useEffect(() => {
    setRowSelection({});
  }, [query]);

  return {
    data,
    loading,
    list,
    total,
    table,
    page,
    pageSize,
    rowSelection,
    setRowSelection,
    handleSearch,
    resetQuery,
    handleRefresh,
  };
}
