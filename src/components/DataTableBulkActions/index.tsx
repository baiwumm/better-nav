/*
 * @Description: 表格批量操作悬浮条
 */
"use client";

import type { AppTable } from "@/types/table-types";
import type { RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Xmark } from "@gravity-ui/icons";
import { Button, Chip, cn, Separator } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface DataTableBulkActionsProps<TData extends RowData> {
  table: AppTable<TData>;
  /** 选中后展示的操作按钮（由页面自行组合） */
  children?: ReactNode;
  className?: string;
}

/** 进/退场动画时长（ms）：与 transition-all duration-200 对齐 */
const EXIT_ANIMATION_MS = 200;

/**
 * 批量操作悬浮条（胶囊形）：行选中数 > 0 时固定显示在底部居中。
 * 布局：计数徽章 | 操作插槽 | 清空按钮；
 * 进场自底部淡入上滑，退场向下淡出滑出（尊重 prefers-reduced-motion）。
 * Esc 键清空选择。
 */
function DataTableBulkActions<TData extends RowData>({
  table,
  children,
  className,
}: DataTableBulkActionsProps<TData>) {
  const selectedCount = table.getSelectedRowModel().rows.length;
  const hasSelection = selectedCount > 0;
  /** mounted：延长退场动画期的渲染；visible：驱动过渡类切换 */
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const exitTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (hasSelection) {
      window.clearTimeout(exitTimer.current);
      setMounted(true);
      // 先以隐藏态插入 DOM，下一帧再切入可见态，保证 CSS 过渡生效
      const raf = requestAnimationFrame(() => setVisible(true));

      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    exitTimer.current = window.setTimeout(
      () => setMounted(false),
      EXIT_ANIMATION_MS,
    );

    return () => window.clearTimeout(exitTimer.current);
  }, [hasSelection]);

  const clearSelection = useCallback(() => {
    table.resetRowSelection();
  }, [table]);

  // 仅在有选中行时监听 Esc
  useEffect(() => {
    if (!hasSelection) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") clearSelection();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasSelection, clearSelection]);

  if (!mounted) return null;

  const hasActions = children != null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div
        aria-live="polite"
        className={cn(
          "pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-overlay py-1.5 ps-3 pe-1.5 shadow-lg transition-all duration-200 ease-out motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          className,
        )}
      >
        <span className="sr-only">已选择 {selectedCount} 项</span>
        <Chip className="mx-1 shrink-0" size="sm">
          {selectedCount}
        </Chip>
        {hasActions ? (
          <Separator className="h-5 self-center" orientation="vertical" />
        ) : null}
        {children}
        {hasActions ? (
          <Separator className="h-5 self-center" orientation="vertical" />
        ) : null}
        <Button
          isIconOnly
          aria-label="清空选择"
          size="sm"
          variant="ghost"
          onPress={clearSelection}
        >
          <Xmark className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default DataTableBulkActions;
