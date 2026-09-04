/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-02-02 10:19:47
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 16:41:29
 * @Description: 顶部区域
 */
'use client'
import { ArrowRotateLeft, Magnifier, Plus } from '@gravity-ui/icons'
import {
  Button,
  Card,
  ListBox,
  SearchField,
  Select,
  Spinner,
} from '@heroui/react'

import ColumnsVisibility from '@/components/ColumnsVisibility'

import type { Category, Website } from '@/types'
import type { AppTable } from '@/types/table-types'
import type { useOverlayState } from '@heroui/react'
import type { Dispatch, FC, KeyboardEvent, SetStateAction } from 'react'

interface HeaderContentProps {
  table: AppTable<Website>
  categorysList: Category[]
  name: string
  setName: Dispatch<SetStateAction<string>>
  categoryId: string
  setCategoryId: Dispatch<SetStateAction<string>>
  loading: boolean
  handleSearch: VoidFunction
  handleReset: VoidFunction
  handleAdd: VoidFunction
  saveModalState: ReturnType<typeof useOverlayState>
}

const HeaderContent: FC<HeaderContentProps> = ({
  table,
  categorysList = [],
  name,
  setName,
  categoryId,
  setCategoryId,
  loading = false,
  handleSearch,
  handleReset,
  handleAdd,
}) => {
  // 回车事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }
  return (
    <Card.Header className="flex justify-between items-start w-full flex-col sm:flex-row sm:items-center gap-2">
      <Card.Title className="flex items-center gap-2 flex-wrap">
        <SearchField
          aria-label="网站名称"
          variant="secondary"
          value={name}
          onChange={setName}
          onKeyDown={handleKeyDown}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="网站名称" className="w-50" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Select
          aria-label="所属分类"
          variant="secondary"
          placeholder="所属分类"
          value={categoryId}
          onChange={id => setCategoryId(id as string)}
          className="w-60"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {categorysList?.map(({ id, name }) => (
                <ListBox.Item key={id} id={id} textValue={name}>
                  {name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Button size="sm" isPending={loading} onPress={handleSearch}>
          {({ isPending }) => (
            <>
              {isPending ? <Spinner color="current" size="sm" /> : <Magnifier />}
              查询
            </>
          )}
        </Button>
        <Button size="sm" variant="secondary" isDisabled={loading} onPress={handleReset}>
          <ArrowRotateLeft />
          重置
        </Button>
        <Button size="sm" variant="outline" onPress={handleAdd}>
          <Plus />
          新增
        </Button>
      </Card.Title>
      <ColumnsVisibility table={table} />
    </Card.Header>
  )
}
export default HeaderContent
