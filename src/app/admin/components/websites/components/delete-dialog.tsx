/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-28 14:04:28
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 17:05:06
 * @Description: 删除弹窗
 */
"use client";
import type { UseOverlayStateReturn } from "@heroui/react";
import type { FC } from "react";

import { AlertDialog, Button, Spinner } from "@heroui/react";
import { useEffect, useRef } from "react";

interface DeleteDialogProps {
  state: UseOverlayStateReturn;
  loading: boolean;
  handleDelConfirm: VoidFunction;
  /** 批量删除的数量：传入时切换为批量文案，不传保持单条删除文案 */
  count?: number;
  onClose?: VoidFunction;
}

const DeleteDialog: FC<DeleteDialogProps> = ({
  state,
  loading = false,
  handleDelConfirm,
  count,
  onClose,
}) => {
  const isBatch = count != null;
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
                ? `确认删除选中的 ${count} 个网站？`
                : "确认删除该网站？"}
            </AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              删除后，{isBatch ? "选中的网站" : "该网站"}及其关联的数据将被
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

export default DeleteDialog;
