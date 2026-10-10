/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-10-09 10:00:00
 * @Description: 后台通用删除确认弹窗（单个删除 / 批量删除共用）
 */
"use client";
import type { UseOverlayStateReturn } from "@heroui/react";
import type { FC } from "react";

import { AlertDialog, Button, Spinner } from "@heroui/react";
import { useEffect, useRef } from "react";

interface AdminDeleteDialogProps {
  state: UseOverlayStateReturn;
  loading?: boolean;
  handleDelConfirm: VoidFunction;
  /** 批量删除的数量：传入时切换为批量文案，不传为单条删除文案 */
  count?: number;
  /** 被删对象名称，如「分类」「网站」 */
  entityName: string;
  onClose?: VoidFunction;
}

const AdminDeleteDialog: FC<AdminDeleteDialogProps> = ({
  state,
  loading = false,
  handleDelConfirm,
  count,
  entityName,
  onClose,
}) => {
  // 传入 count 即为批量删除
  const isBatch = count != null;
  const subject = isBatch ? `选中的${entityName}` : `该${entityName}`;
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (wasOpenRef.current && !state.isOpen) {
      onClose?.();
    }
    wasOpenRef.current = state.isOpen;
  }, [state.isOpen, onClose]);

  return (
    <AlertDialog.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-100">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>
              {isBatch
                ? `确认删除选中的 ${count} 个${entityName}？`
                : `确认删除${subject}？`}
            </AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              删除后，{subject}及其关联的数据将被
              <strong>永久移除</strong>
              ，且无法恢复。 请确认当前操作不会影响正在使用的业务或历史数据。
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button isDisabled={loading} slot="close" variant="tertiary">
              取消
            </Button>
            <Button
              isPending={loading}
              variant="danger"
              onPress={handleDelConfirm}
            >
              {({ isPending }) => (
                <>
                  {isPending ? <Spinner color="current" size="sm" /> : null}
                  {isPending ? "正在删除..." : "确认删除"}
                </>
              )}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
};

export default AdminDeleteDialog;
