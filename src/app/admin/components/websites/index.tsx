/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-23 15:24:22
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 17:20:23
 * @Description: 网站列表
 */
"use client";
import type { Category, PaginatingResponse, Website } from "@/types";
import type {
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { FC } from "react";

import { CircleCheckFill } from "@gravity-ui/icons";
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    desc: false,
    vpn: false,
    commonlyUsed: false,
    updated_at: false,
  });

  // 保存弹窗
  const saveModalState = useOverlayState();
  // 删除弹窗
  const delDialogState = useOverlayState();
  // 编辑数据
  const [editData, setEditData] = useState<Website | null>(null);
  // 站点标签
  const [tags, setTags] = useState<string[]>([]);

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

  // 删除网站
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

  // 删除回调
  const handleDel = useCallback(
    (row: Website) => {
      setEditData(row);
      delDialogState.open();
    },
    [delDialogState],
  );

  // 确认删除回调
  const handleDelConfirm = () => {
    if (editData?.id) {
      fetchDelWebsite({ id: editData.id });
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
    getRowId: (row: Website) => row.id,
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
        handleDelConfirm={handleDelConfirm}
        loading={delLoading}
        state={delDialogState}
        onClose={() => setEditData(null)}
      />
    </>
  );
};

export default Websites;
