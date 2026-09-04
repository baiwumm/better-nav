/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-28 09:23:37
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 17:20:53
 * @Description: 渲染分页
 */
import { Description, ListBox, Pagination, Select } from '@heroui/react'

import type { AppTable } from '@/types/table-types'

interface DataTablePaginationProps<TData> {
  table: AppTable<TData>
  total: number
}

interface PaginationToken {
  key: string
  type: 'page' | 'ellipsis'
  value?: number
}

function DataTablePagination<TData>({ table, total = 0 }: DataTablePaginationProps<TData>) {
  // 渲染中间分页
  const { pageIndex } = table.state.pagination
  const pageCount = table.getPageCount()

  function getPageNumbers(pageIndex: number, pageCount: number, delta = 2) {
    const pages: PaginationToken[] = []
    let ellipsisCount = 0

    const start = Math.max(0, pageIndex - delta)
    const end = Math.min(pageCount - 1, pageIndex + delta)

    if (start > 0) {
      pages.push({ key: 'page-0', type: 'page', value: 0 })
      if (start > 1)
        pages.push({ key: `ellipsis-${++ellipsisCount}`, type: 'ellipsis' })
    }

    for (let i = start; i <= end; i++) {
      pages.push({ key: `page-${i}`, type: 'page', value: i })
    }

    if (end < pageCount - 1) {
      if (end < pageCount - 2)
        pages.push({ key: `ellipsis-${++ellipsisCount}`, type: 'ellipsis' })
      pages.push({ key: `page-${pageCount - 1}`, type: 'page', value: pageCount - 1 })
    }

    return pages
  }

  const pages = getPageNumbers(pageIndex, pageCount)
  return (
    <div className="w-full grid grid-cols-3 items-center">
      {/* 条数 */}
      <Description className="justify-self-start flex items-center gap-1">
        <span>每页条数:</span>
        <Select
          aria-label="分页选择框"
          variant="secondary"
          placeholder="请选择"
          value={table.state.pagination.pageSize}
          onChange={key => table.setPageSize(Number(key))}
          className="w-30"
        >
          <Select.Trigger className="items-center">
            <Select.Value className="text-xs text-muted" />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {[5, 10, 20, 50].map((size) => {
                const id = `${size}`
                return (
                  <ListBox.Item key={id} id={size} textValue={id} className="text-xs text-muted">
                    {size}
                    {' '}
                    条/页
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                )
              })}
            </ListBox>
          </Select.Popover>
        </Select>
      </Description>
      <div className="justify-self-center">
        <Pagination size="sm">
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous isDisabled={!table.getCanPreviousPage()} onPress={() => table.previousPage()}>
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>
            {pages.map(p =>
              p.type === 'ellipsis'
                ? (
                    <Pagination.Item key={p.key}>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  )
                : (
                    <Pagination.Item key={p.key}>
                      <Pagination.Link isActive={p.value === pageIndex} onPress={() => table.setPageIndex(p.value!)}>
                        {p.value! + 1}
                      </Pagination.Link>
                    </Pagination.Item>
                  ),
            )}
            <Pagination.Item>
              <Pagination.Next isDisabled={!table.getCanNextPage()} onPress={() => table.nextPage()}>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </div>
      <Description className="justify-self-end">
        共
        {total}
        {' '}
        条数据
      </Description>
    </div>
  )
}
export default DataTablePagination
