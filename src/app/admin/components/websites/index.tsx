/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-23 15:24:22
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-10-09 10:00:00
 * @Description: 网站列表
 */
"use client";
import type {
  Category,
  PaginatingResponse,
  Website,
  WebsiteBatchResult,
} from "@/types";
import type { AppColumnDef } from "@/types/table-types";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import type { FC } from "react";

import { CircleCheckFill } from "@gravity-ui/icons";
import { Card, toast, useOverlayState } from "@heroui/react";
import { useCallback, useMemo, useRef, useState } from "react";

import BulkActions from "./components/bulk-actions";
import { getColumns } from "./components/columns";
import SaveModal from "./components/save-modal";

import AdminDataTable from "@/components/AdminDataTable";
import AdminDeleteDialog from "@/components/AdminDeleteDialog";
import AdminHeaderContent from "@/components/AdminHeaderContent";
import DataTablePagination from "@/components/DataTablePagination";
import { useSwrMutation, useSwrQuery } from "@/hooks/use-swr";
import { useAdminTablePage } from "@/hooks/use-admin-table-page";
import { RESPONSE } from "@/lib/utils";

/** 批量操作类型：仅用于成功后区分 toast 文案 */
type BatchAction = "delete" | "moveCategory";

/** 初始列可见性 */
const INITIAL_COLUMN_VISIBILITY: ColumnVisibilityState = {
  desc: false,
  vpn: false,
  commonlyUsed: false,
  updated_at: false,
};

/** 重置时的查询条件 */
const INITIAL_FILTERS = { name: "", category_id: "" };

const Websites: FC = () => {
  // 搜索参数
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const filters = useMemo(
    () => ({ name, category_id: categoryId }),
    [name, categoryId],
  );
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

  // 删除回调（单条）
  const handleDel = useCallback(
    (row: Website) => {
      setEditData(row);
      setDelCount(undefined);
      delDialogState.open();
    },
    [delDialogState],
  );

  const {
    loading,
    total,
    table,
    rowSelection,
    setRowSelection,
    handleSearch,
    resetQuery,
    handleRefresh,
  } = useAdminTablePage<Website>({
    endpoint: "/websites",
    filters,
    initialFilters: INITIAL_FILTERS,
    initialColumnVisibility: INITIAL_COLUMN_VISIBILITY,
    buildColumns: useCallback(
      ({
        page,
        pageSize,
      }: {
        page: number;
        pageSize: number;
      }): AppColumnDef<Website>[] =>
        getColumns({ handleEdit, handleDel, page, pageSize }),
      [handleEdit, handleDel],
    ),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

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

  // 重置
  const handleReset = () => {
    setName("");
    setCategoryId("");
    resetQuery();
  };

  return (
    <>
      <Card className="shadow-lg">
        <AdminHeaderContent
          categoryId={categoryId}
          categorysList={categorysList || []}
          handleAdd={handleAdd}
          handleReset={handleReset}
          handleSearch={handleSearch}
          loading={loading}
          name={name}
          namePlaceholder="网站名称"
          setCategoryId={setCategoryId}
          setName={setName}
          table={table}
        />
        <Card.Content>
          <AdminDataTable label="网站列表" loading={loading} table={table} />
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
      <AdminDeleteDialog
        count={delCount}
        entityName="网站"
        handleDelConfirm={handleDelConfirm}
        loading={delCount != null ? batchLoading : delLoading}
        state={delDialogState}
        onClose={handleDelDialogClose}
      />
    </>
  );
};

export default Websites;
