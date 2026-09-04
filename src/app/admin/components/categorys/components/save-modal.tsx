"use client";
import type { Category, CategorySaveParams } from "@/types";
import type { UseOverlayStateReturn } from "@heroui/react";
import type { FC, FormEvent } from "react";

import { CircleCheckFill, Folder } from "@gravity-ui/icons";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  NumberField,
  Spinner,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import { useEffect, useRef } from "react";

import { useSwrMutation } from "@/hooks/use-swr";
import { RESPONSE } from "@/lib/utils";

interface SaveModalProps {
  state: UseOverlayStateReturn;
  initialValues: Category | null;
  handleRefresh: VoidFunction;
  onClose?: VoidFunction;
}

const SaveModal: FC<SaveModalProps> = ({
  state,
  initialValues,
  handleRefresh,
  onClose,
}) => {
  // 表单实例
  const formRef = useRef<HTMLFormElement>(null);
  const wasOpenRef = useRef(false);
  const isEdit = !!initialValues?.id;
  const actionText = isEdit ? "编辑" : "新增";

  useEffect(() => {
    if (wasOpenRef.current && !state.isOpen) {
      formRef?.current?.reset();
      onClose?.();
    }
    wasOpenRef.current = state.isOpen;
  }, [state.isOpen, onClose]);

  // 保存表单
  const { loading, trigger } = useSwrMutation(
    "/categorys",
    isEdit ? "PUT" : "POST",
    {
      onSuccess: ({ code }) => {
        if (code === RESPONSE.SUCCESS) {
          state.close();
          toast.success("提交成功", {
            timeout: 2000,
            indicator: <CircleCheckFill />,
          });
          handleRefresh?.();
        }
      },
    },
  );

  // 表单提交
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CategorySaveParams = {
      name: formData.get("name") as string,
      sort: Number(formData.get("sort")),
    };

    initialValues?.id
      ? await trigger({ id: initialValues.id, data })
      : await trigger({ data });
  };

  return (
    <Modal.Backdrop
      isKeyboardDismissDisabled
      isDismissable={false}
      isOpen={state.isOpen}
      onOpenChange={state.setOpen}
    >
      <Modal.Container placement="auto">
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
              <Folder className="size-5" />
            </Modal.Icon>
            <Modal.Heading>{`${actionText}分类`}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="py-4 px-1">
            <Surface variant="default">
              <Form
                key={initialValues?.id ?? "create"}
                ref={formRef}
                className="flex flex-col gap-4"
                id="category-form"
                onSubmit={onSubmit}
              >
                <TextField
                  isRequired
                  defaultValue={initialValues?.name ?? ""}
                  maxLength={100}
                  minLength={1}
                  name="name"
                  validate={(value) => {
                    if (!value) {
                      return "请输入分类名称";
                    }

                    return null;
                  }}
                >
                  <Label>分类名称</Label>
                  <Input
                    fullWidth
                    aria-label="Name"
                    placeholder="请输入分类名称"
                    variant="secondary"
                  />
                  <FieldError />
                </TextField>
                <NumberField
                  isRequired
                  defaultValue={initialValues?.sort ?? 1}
                  maxValue={99}
                  minValue={1}
                  name="sort"
                  validate={(value) => {
                    if (!value) {
                      return "请输入排序";
                    }

                    return null;
                  }}
                  variant="secondary"
                >
                  <Label>排序</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
              </Form>
            </Surface>
          </Modal.Body>
          <Modal.Footer>
            <Button isDisabled={loading} slot="close" variant="outline">
              取消
            </Button>
            <Button form="category-form" isPending={loading} type="submit">
              {({ isPending }) => (
                <>
                  {isPending ? <Spinner color="current" size="sm" /> : null}
                  {isPending ? "正在提交..." : "确定"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default SaveModal;
