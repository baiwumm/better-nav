/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-23 15:24:22
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-10-09 10:00:00
 * @Description: 网站分类
 */
"use client";
import type { Category } from "@/types";
import type { AppColumnDef } from "@/types/table-types";
import type { ColumnVisibilityState } from "@tanstack/react-table";
import type { FC } from "react";

import { CircleCheckFill, CircleXmarkFill } from "@gravity-ui/icons";
import { Card, toast, useOverlayState } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";

import { getColumns } from "./components/columns";
import SaveModal from "./components/save-modal";

import AdminDataTable from "@/components/AdminDataTable";
import AdminDeleteDialog from "@/components/AdminDeleteDialog";
import AdminHeaderContent from "@/components/AdminHeaderContent";
import DataTablePagination from "@/components/DataTablePagination";
import { useSwrMutation } from "@/hooks/use-swr";
import { useAdminTablePage } from "@/hooks/use-admin-table-page";
import { RESPONSE } from "@/lib/utils";

/** 初始列可见性 */
const INITIAL_COLUMN_VISIBILITY: ColumnVisibilityState = {
  updated_at: false,
};

/** 重置时的查询条件 */
const INITIAL_FILTERS = { name: "" };

const Categorys: FC = () => {
  // 搜索参数
  const [name, setName] = useState("");
  const filters = useMemo(() => ({ name }), [name]);
  // 保存弹窗
  const saveModalState = useOverlayState();
  // 删除弹窗
  const delDialogState = useOverlayState();
  // 编辑数据
  const [editData, setEditData] = useState<Category | null>(null);

  // 编辑回调
  const handleEdit = useCallback(
    (row: Category) => {
      setEditData(row);
      saveModalState.open();
    },
    [saveModalState],
  );

  // 新增回调
  const handleAdd = useCallback(() => {
    setEditData(null);
    saveModalState.open();
  }, [saveModalState]);

  // 删除回调
  const handleDel = useCallback(
    (row: Category) => {
      if (row?.websites?.length) {
        toast.danger("该分类下存在关联网站，无法直接删除.", {
          indicator: <CircleXmarkFill />,
          timeout: 3000,
        });

        return;
      }
      setEditData(row);
      delDialogState.open();
    },
    [delDialogState],
  );

  const { loading, total, table, handleSearch, resetQuery, handleRefresh } =
    useAdminTablePage<Category>({
      endpoint: "/categorys",
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
        }): AppColumnDef<Category>[] =>
          getColumns({ handleEdit, handleDel, page, pageSize }),
        [handleEdit, handleDel],
      ),
      getRowId: (row) => row.id,
    });

  // 删除分类
  const { loading: delLoading, trigger: fetchDelCategory } = useSwrMutation(
    "/categorys",
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

  // 确认删除回调
  const handleDelConfirm = () => {
    if (editData?.id) {
      fetchDelCategory({ id: editData.id });
    }
  };

  // 重置
  const handleReset = () => {
    setName("");
    resetQuery();
  };

  return (
    <>
      <Card className="shadow-lg">
        <AdminHeaderContent
          handleAdd={handleAdd}
          handleReset={handleReset}
          handleSearch={handleSearch}
          loading={loading}
          name={name}
          namePlaceholder="分类名称"
          setName={setName}
          table={table}
        />
        <Card.Content>
          <AdminDataTable label="网站分类" loading={loading} table={table} />
        </Card.Content>
        <Card.Footer>
          <DataTablePagination table={table} total={total || 0} />
        </Card.Footer>
      </Card>
      {/* 保存弹窗 */}
      <SaveModal
        handleRefresh={handleRefresh}
        initialValues={editData}
        state={saveModalState}
        onClose={() => setEditData(null)}
      />
      {/* 删除弹窗 */}
      <AdminDeleteDialog
        entityName="分类"
        handleDelConfirm={handleDelConfirm}
        loading={delLoading}
        state={delDialogState}
        onClose={() => setEditData(null)}
      />
    </>
  );
};

export default Categorys;
