/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-23 15:48:19
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-03-11 13:57:44
 * @Description: 表格列设置
 */
import { Sliders } from '@gravity-ui/icons'
import { Button, Dropdown, Label } from '@heroui/react'

import type { AppTable } from '@/types/table-types'
import type { Selection } from '@heroui/react'

function ColumnsVisibility<TData>({ table }: { table: AppTable<TData> }) {
  const columns = table.getAllLeafColumns().filter(column => column.getCanHide())

  const selectedKeys = new Set(
    columns.filter(c => c.getIsVisible()).map(c => c.id),
  )

  const handleSelectionChange = (keys: Selection) => {
    const visibleIds = new Set(Array.from(keys))

    columns.forEach((column) => {
      column.toggleVisibility(visibleIds.has(column.id))
    })
  }
  return (
    <Dropdown>
      <Button size="sm" variant="outline">
        <Sliders />
        列设置
      </Button>
      <Dropdown.Popover className="min-w-37.5">
        <Dropdown.Menu selectedKeys={selectedKeys} selectionMode="multiple" onSelectionChange={handleSelectionChange}>
          {columns.map(column => (
            <Dropdown.Item
              key={column.id}
              id={column.id}
              className="capitalize"
            >
              <Dropdown.ItemIndicator />
              <Label>{column.columnDef?.header as string}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}

export default ColumnsVisibility
