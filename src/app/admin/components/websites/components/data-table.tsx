/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-28 09:01:56
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 09:41:58
 * @Description: 数据表格
 */
import { ChevronUp } from '@gravity-ui/icons'
import { cn, Table } from '@heroui/react'
import { flexRender } from '@tanstack/react-table'

import EmptyContent from '@/components/EmptyContent'
import TableLoading from '@/components/TableLoading'

import type { Website } from '@/types'
import type { AppTable } from '@/types/table-types'
import type { FC } from 'react'

interface DataTableProps {
  table: AppTable<Website>
  loading: boolean
}

const DataTable: FC<DataTableProps> = ({ table, loading = false }) => {
  return (
    <div className="relative">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="网站列表">
            <Table.Header>
              {table.getHeaderGroups()[0]!.headers.map((header) => {
                const sortDirection = header.column.getIsSorted()
                return (
                  <Table.Column
                    key={header.id}
                    id={header.id}
                    isRowHeader
                    allowsSorting={header.column.getCanSort()}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortDirection && (
                        <ChevronUp
                          className={cn(
                            'size-3 transform transition-transform duration-100 ease-out',
                            sortDirection === 'desc' ? 'rotate-180' : '',
                          )}
                        />
                      )}
                    </div>
                  </Table.Column>
                )
              })}
            </Table.Header>
            <Table.Body renderEmptyState={() => <EmptyContent />}>
              {table.getRowModel().rows.map(row => (
                <Table.Row key={row.id} id={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <Table.Cell key={cell.id} className="text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  )
}
export default DataTable
