/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-23 15:24:22
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 17:20:23
 * @Description: 网站列表
 */
"use client";
import type {
  Category,
  PaginatingResponse,
  Website,
  WebsiteBatchResult,
} from "@/types";
import type {
  ColumnVisibilityState,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import type { FC } from "react";

import { CircleCheckFill } from "@gravity-ui/icons";
import { Card, toast, useOverlayState } from "@heroui/react";
import { useTable } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BulkActions from "./components/bulk-actions";
import { getColumns } from "./components/columns";
import DataTable from "./components/data-table";
import DeleteDialog from "./components/delete-dialog";
import HeaderContent from "./components/header-content";
import SaveModal from "./components/save-modal";

import { appTableFeatures } from "@/types/table-types";
import { get, RESPONSE } from "@/lib/utils";
import { useSwrMutation, useSwrQuery } from "@/hooks/use-swr";
import DataTablePagination from "@/components/DataTablePagination";

/** 批量操作类型：仅用于成功后区分 toast 文案 */
type BatchAction = "delete" | "moveCategory";

const Websites: FC = () => {
  // 搜索参数
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const searchParams = useMemo(
    () => ({ name, category_id: categoryId, ...pagination }),
    [name, categoryId, pagination],
  );
  // 排序
  const [sorting, setSorting] = useState<SortingState>([]);
  // 受控列
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({
      desc: false,
      vpn: false,
      commonlyUsed: false,
      updated_at: false,
    });
  // 行选择（受控，仅当前页；翻页/搜索/重置时清空）
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // 保存弹窗
  const saveModalState = useOverlayState();
  // 删除弹窗
  const delDialogState = useOverlayState();
  // 编辑数据
  const [editData, setEditData] = useState<Website | null>(null);
  // 站点标签
  const [tags, setTags] = useState<string[]>([]);
  // 批量删除数量：有值时删除弹窗切换为批量文案并走批量接口
  const [delCount, setDelCount] = useState<number | undefined>(undefined);
  // 最近一次批量操作的类型与目标分类名（仅在成功回调中读取，用 ref 避免多余渲染）
  const lastBatchRef = useRef<{ action: BatchAction; categoryName: string }>({
    action: "delete",
    categoryName: "",
  });

  // 请求分类列表（下拉选项）
  const { data: categorysResult } = useSwrQuery<PaginatingResponse<Category>>([
    "/categorys",
    { pageIndex: 0, pageSize: 999 },
  ]);
  const categorysList = useMemo(
    () => categorysResult?.list ?? [],
    [categorysResult],
  );

  // 请求网站列表
  const [query, setQuery] = useState(searchParams);
  const { data, loading, mutate } = useSwrQuery<PaginatingResponse<Website>>(
    ["/websites", query],
    { keepPreviousData: true },
  );
  const total = useMemo(() => data?.total ?? 0, [data]);
  const list = useMemo(() => data?.list ?? [], [data]);
  const searchParamsRef = useRef(searchParams);
  const queryRef = useRef(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // 强制重新验证当前列表（删除/保存成功后刷新，绕过去重缓存）
  const handleRefresh = () => {
    mutate();
  };

  // 发起请求：搜索参数变化时更新 key 触发新请求；参数未变化时强制重新验证（保持原"点击查询即刷新"行为）
  const handleSearch = () => {
    const next = searchParamsRef.current;

    if (JSON.stringify(next) === JSON.stringify(queryRef.current)) {
      mutate();
    } else {
      setQuery(next);
    }
  };

  // 重置
  const handleReset = () => {
    setName("");
    setCategoryId("");
    setPagination({ pageIndex: 0, pageSize: 10 });
    setQuery({
      name: "",
      category_id: "",
      pageIndex: 0,
      pageSize: 10,
    });
  };

  // 编辑回调
  const handleEdit = useCallback(
    (row: Website) => {
      setEditData(row);
      setTags(row?.tags ?? []);
      saveModalState.open();
    },
    [saveModalState],
  );

  // 新增回调
  const handleAdd = useCallback(() => {
    setEditData(null);
    setTags([]);
    saveModalState.open();
  }, [saveModalState]);

  // 删除网站（单条）
  const { loading: delLoading, trigger: fetchDelWebsite } = useSwrMutation(
    "/websites",
    "DELETE",
    {
      onSuccess: ({ code }) => {
        if (code === RESPONSE.SUCCESS) {
          delDialogState.close();
          toast.success("删除成功", {
            timeout: 2000,
            indicator: <CircleCheckFill />,
          });
          handleRefresh();
        }
      },
    },
  );

  // 批量操作网站（批量移动分类 / 批量删除）
  const { loading: batchLoading, trigger: fetchBatchWebsite } =
    useSwrMutation<WebsiteBatchResult>("/websites/batch", "POST", {
      onSuccess: ({ code, data }) => {
        if (code === RESPONSE.SUCCESS) {
          const count = data?.count ?? 0;
          const { action, categoryName } = lastBatchRef.current;

          delDialogState.close();
          toast.success(
            action === "delete"
              ? `已删除 ${count} 个网站`
              : `已移动 ${count} 个网站到「${categoryName}」`,
            {
              timeout: 2000,
              indicator: <CircleCheckFill />,
            },
          );
          setRowSelection({});
          handleRefresh();
        }
      },
    });

  // 删除回调（单条）
  const handleDel = useCallback(
    (row: Website) => {
      setEditData(row);
      setDelCount(undefined);
      delDialogState.open();
    },
    [delDialogState],
  );

  // 批量移动分类（无需二次确认，可逆操作）
  const handleBatchMove = useCallback(
    (targetCategoryId: string) => {
      const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]);

      if (!ids.length) return;
      lastBatchRef.current = {
        action: "moveCategory",
        categoryName:
          categorysList.find((item) => item.id === targetCategoryId)?.name ??
          "",
      };
      fetchBatchWebsite({
        data: {
          action: "moveCategory",
          ids,
          category_id: targetCategoryId,
        },
      });
    },
    [rowSelection, categorysList, fetchBatchWebsite],
  );

  // 批量删除：打开确认弹窗
  const handleBatchDelete = useCallback(() => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]);

    if (!ids.length) return;
    setEditData(null);
    setDelCount(ids.length);
    delDialogState.open();
  }, [rowSelection, delDialogState]);

  // 确认删除回调（批量 / 单条 分流）
  const handleDelConfirm = () => {
    if (delCount != null) {
      const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]);

      if (!ids.length) return;
      lastBatchRef.current = { action: "delete", categoryName: "" };
      fetchBatchWebsite({ data: { action: "delete", ids } });
    } else if (editData?.id) {
      fetchDelWebsite({ id: editData.id });
    }
  };

  // 删除弹窗关闭回调
  const handleDelDialogClose = useCallback(() => {
    setEditData(null);
    setDelCount(undefined);
  }, []);

  // 列配置项
  const columns = useMemo(
    () =>
      getColumns({
        handleEdit,
        handleDel,
        page: get(data, "page", 0),
        pageSize: get(data, "pageSize", 0),
      }),
    [handleEdit, handleDel, data],
  );

  // 表格实例
  const table = useTable({
    data: list,
    columns,
    features: appTableFeatures,
    pageCount: Math.ceil((total || 0) / searchParams.pageSize),
    getRowId: (row: Website) => row.id,
    enableRowSelection: true,
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

  return (
    <>
      <Card className="shadow-lg">
        <HeaderContent
          categoryId={categoryId}
          categorysList={categorysList || []}
          handleAdd={handleAdd}
          handleReset={handleReset}
          handleSearch={handleSearch}
          loading={loading}
          name={name}
          saveModalState={saveModalState}
          setCategoryId={setCategoryId}
          setName={setName}
          table={table}
        />
        <Card.Content>
          <DataTable loading={loading} table={table} />
        </Card.Content>
        <Card.Footer>
          <DataTablePagination table={table} total={total || 0} />
        </Card.Footer>
      </Card>
      {/* 批量操作栏 */}
      <BulkActions
        categorysList={categorysList}
        handleBatchDelete={handleBatchDelete}
        handleBatchMove={handleBatchMove}
        loading={batchLoading}
        table={table}
      />
      {/* 保存弹窗 */}
      <SaveModal
        categorysList={categorysList || []}
        handleRefresh={handleRefresh}
        initialValues={editData}
        setTags={setTags}
        state={saveModalState}
        tags={tags}
        onClose={() => setEditData(null)}
      />
      {/* 删除弹窗 */}
      <DeleteDialog
        count={delCount}
        handleDelConfirm={handleDelConfirm}
        loading={delCount != null ? batchLoading : delLoading}
        state={delDialogState}
        onClose={handleDelDialogClose}
      />
    </>
  );
};

export default Websites;
