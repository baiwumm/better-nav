/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-10-09 10:00:00
 * @Description: 后台通用数据表格（分类列表 / 网站列表共用）
 */
"use client";
import type { RowData } from "@tanstack/react-table";
import type { AppTable } from "@/types/table-types";

import { ChevronUp } from "@gravity-ui/icons";
import { cn, Table } from "@heroui/react";
import { flexRender } from "@tanstack/react-table";

import EmptyContent from "@/components/EmptyContent";
import TableLoading from "@/components/TableLoading";

interface AdminDataTableProps<TData extends RowData> {
  table: AppTable<TData>;
  /** 表格的无障碍名称，如「网站分类」「网站列表」 */
  label: string;
  loading?: boolean;
}

function AdminDataTable<TData extends RowData>({
  table,
  label,
  loading = false,
}: AdminDataTableProps<TData>) {
  return (
    <div className="relative">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label={label}>
            <Table.Header>
              {table.getHeaderGroups()[0]!.headers.map((header) => {
                const sortDirection = header.column.getIsSorted();

                return (
                  <Table.Column
                    key={header.id}
                    isRowHeader
                    allowsSorting={header.column.getCanSort()}
                    id={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sortDirection && (
                        <ChevronUp
                          className={cn(
                            "size-3 transform transition-transform duration-100 ease-out",
                            sortDirection === "desc" ? "rotate-180" : "",
                          )}
                        />
                      )}
                    </div>
                  </Table.Column>
                );
              })}
            </Table.Header>
            <Table.Body renderEmptyState={() => <EmptyContent />}>
              {table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id} id={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <TableLoading loading={loading} />
    </div>
  );
}

export default AdminDataTable;
