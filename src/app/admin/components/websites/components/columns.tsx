'use client'

import { Check, PencilToSquare, TrashBin, Xmark } from '@gravity-ui/icons'
import {
  Button,
  Chip,
  Description,
  Link,
  Switch,
  Tooltip,
} from '@heroui/react'
import { createColumnHelper } from '@tanstack/react-table'
import Image from 'next/image'

import { formatDate, generateLogoUrl } from '@/lib/utils'

import type { Website } from '@/types'
import type { AppTableFeatures } from '@/types/table-types'

const columnHelper = createColumnHelper<AppTableFeatures, Website>()

interface ColumnsProps {
  handleEdit: (row: Website) => void
  handleDel: (row: Website) => void
  page: number
  pageSize: number
}

export function getColumns({
  handleEdit,
  handleDel,
  page = 1,
  pageSize = 10,
}: ColumnsProps) {
  const booleanColumns = [
    { key: 'pinned', header: '置顶' },
    { key: 'vpn', header: 'VPN' },
    { key: 'recommend', header: '推荐' },
    { key: 'commonlyUsed', header: '常用' },
  ] as const

  return [

    columnHelper.display({
      id: 'index',
      header: '序号',
      cell: ({ row }) => (
        <Chip>
          {(page - 1) * pageSize + row.index + 1}
        </Chip>
      ),
    }),

    columnHelper.accessor('name', {
      header: '网站名称',
      cell: (info) => {
        const row = info.row.original
        return (
          <Link href={row.url} target="_blank">
            {info.getValue()}
            <Link.Icon />
          </Link>
        )
      },
    }),

    columnHelper.accessor('desc', {
      header: '网站描述',
      cell: (info) => {
        const val = info.getValue()

        if (!val)
          return '--'

        return (
          <Tooltip delay={0}>
            <Tooltip.Trigger aria-label="Description">
              <span className="truncate">
                {val.length > 15 ? `${val.slice(0, 15)}...` : val}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content showArrow>
              <Tooltip.Arrow />
              <p>{val}</p>
            </Tooltip.Content>
          </Tooltip>
        )
      },
    }),

    columnHelper.accessor('logo', {
      header: 'Logo',
      cell: (info) => {
        const url = info.getValue()
        const row = info.row.original

        if (!url)
          return '--'

        return (
          <div className="flex justify-center size-8 relative">
            <Image
              alt={row.name}
              fill
              src={generateLogoUrl(url)}
              className="object-contain rounded-lg"
            />
          </div>
        )
      },
    }),

    columnHelper.accessor('tags', {
      header: '标签',
      cell: (info) => {
        const tags = info.getValue()

        if (!tags?.length)
          return '--'

        return (
          <div className="flex justify-center items-center gap-1">
            {tags.map(tag => (
              <Chip key={tag} size="sm" variant="soft">{tag}</Chip>
            ))}
          </div>
        )
      },
    }),

    columnHelper.display({
      id: 'category',
      header: '所属分类',
      cell: ({ row }) => (
        <Chip color="success" variant="soft">
          {row.original.category.name}
        </Chip>
      ),
    }),

    columnHelper.accessor('visitCount', {
      header: '访问次数',
      cell: info => (
        <Chip color="accent" variant="secondary">
          {info.getValue()}
        </Chip>
      ),
    }),

    columnHelper.accessor('sort', {
      header: '排序',
      cell: info => (
        <Chip color="warning" variant="soft">
          {info.getValue()}
        </Chip>
      ),
    }),

    ...booleanColumns.map(({ key, header }) =>
      columnHelper.accessor(key, {
        header,
        cell: info => (
          <Switch isReadOnly isSelected={info.getValue()}>
            {({ isSelected }) => (
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb>
                    <Switch.Icon>
                      {isSelected
                        ? (
                            <Check className="size-3 text-inherit opacity-100" />
                          )
                        : (
                            <Xmark className="size-3 text-inherit opacity-70" />
                          )}
                    </Switch.Icon>
                  </Switch.Thumb>
                </Switch.Control>
              </Switch.Content>
            )}
          </Switch>
        ),
      }),
    ),

    columnHelper.accessor('created_at', {
      header: '创建时间',
      cell: ({ getValue }) => (
        <Description>
          {formatDate(getValue(), 'datetime')}
        </Description>
      ),
    }),

    columnHelper.accessor('updated_at', {
      header: '更新时间',
      cell: ({ getValue }) => (
        <Description>
          {formatDate(getValue(), 'datetime')}
        </Description>
      ),
    }),

    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center justify-center min-w-25">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => handleEdit(row.original)}
            className="text-xs"
          >
            <PencilToSquare />
            修改
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onPress={() => handleDel(row.original)}
            className="text-xs text-danger hover:bg-danger-soft"
          >
            <TrashBin />
            删除
          </Button>
        </div>
      ),
    }),

  ]
}
