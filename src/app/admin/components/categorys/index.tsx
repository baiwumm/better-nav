/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-23 15:24:22
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 17:20:03
 * @Description: 网站分类
 */
"use client";
import type { Category, PaginatingResponse } from "@/types";
import type {
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { FC } from "react";

import { CircleCheckFill, CircleXmarkFill } from "@gravity-ui/icons";
import { Card, toast, useOverlayState } from "@heroui/react";
import { useTable } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getColumns } from "./components/columns";
import DataTable from "./components/data-table";
import DeleteDialog from "./components/delete-dialog";
import HeaderContent from "./components/header-content";
import SaveModal from "./components/save-modal";

import { appTableFeatures } from "@/types/table-types";
import { get, RESPONSE } from "@/lib/utils";
import { useSwrMutation, useSwrQuery } from "@/hooks/use-swr";
import DataTablePagination from "@/components/DataTablePagination";

const Categorys: FC = () => {
  // 搜索参数
  const [name, setName] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const searchParams = useMemo(
    () => ({ name, ...pagination }),
    [name, pagination],
  );
  // 排序
  const [sorting, setSorting] = useState<SortingState>([]);
  // 受控列
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    updated_at: false,
  });
  // 保存弹窗
  const saveModalState = useOverlayState();
  // 删除弹窗
  const delDialogState = useOverlayState();
  // 编辑数据
  const [editData, setEditData] = useState<Category | null>(null);

  // 请求分类列表
  const [query, setQuery] = useState(searchParams);
  const { data, loading, mutate } = useSwrQuery<PaginatingResponse<Category>>(
    ["/categorys", query],
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
    setPagination({ pageIndex: 0, pageSize: 10 });
    setQuery({
      name: "",
      pageIndex: 0,
      pageSize: 10,
    });
  };

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

  // 确认删除回调
  const handleDelConfirm = () => {
    if (editData?.id) {
      fetchDelCategory({ id: editData.id });
    }
  };

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
    getRowId: (row: Category) => row.id,
    state: {
      pagination,
      sorting,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
  });

  // 分页变化自动查询
  useEffect(() => {
    setQuery((q) => ({
      ...q,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }));
  }, [pagination.pageIndex, pagination.pageSize]);

  return (
    <>
      <Card className="shadow-lg">
        <HeaderContent
          handleAdd={handleAdd}
          handleReset={handleReset}
          handleSearch={handleSearch}
          loading={loading}
          name={name}
          saveModalState={saveModalState}
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
      {/* 保存弹窗 */}
      <SaveModal
        handleRefresh={handleRefresh}
        initialValues={editData}
        state={saveModalState}
        onClose={() => setEditData(null)}
      />
      {/* 删除弹窗 */}
      <DeleteDialog
        handleDelConfirm={handleDelConfirm}
        loading={delLoading}
        state={delDialogState}
        onClose={() => setEditData(null)}
      />
    </>
  );
};

export default Categorys;
