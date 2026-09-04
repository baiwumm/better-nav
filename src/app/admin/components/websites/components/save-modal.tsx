"use client";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import type { Category, Website, WebsiteSaveParams } from "@/types";
import type { UseOverlayStateReturn } from "@heroui/react";
import type { Dispatch, FC, FormEvent, SetStateAction } from "react";

import { Check, CircleCheckFill, Globe, Xmark } from "@gravity-ui/icons";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  NumberField,
  Select,
  Spinner,
  Surface,
  Switch,
  SwitchGroup,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { useEffect, useRef, useState } from "react";

import LogoUpload from "./logo-upload";

import TagInputs from "@/components/ui/tag-inputs";
import { useSwrMutation } from "@/hooks/use-swr";
import { generateLogoUrl, get, RESPONSE } from "@/lib/utils";

const SwitchOptions: { name: string; label: string }[] = [
  { name: "pinned", label: "置顶" },
  { name: "vpn", label: "VPN" },
  { name: "recommend", label: "推荐" },
  { name: "commonlyUsed", label: "常用" },
];

interface SaveModalProps {
  state: UseOverlayStateReturn;
  initialValues: Website | null;
  handleRefresh: VoidFunction;
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
  categorysList: Category[];
  onClose?: VoidFunction;
}

const SaveModal: FC<SaveModalProps> = ({
  state,
  initialValues,
  handleRefresh,
  tags = [],
  setTags,
  categorysList = [],
  onClose,
}) => {
  // 表单实例
  const formRef = useRef<HTMLFormElement>(null);
  const wasOpenRef = useRef(false);
  const actionText = initialValues ? "编辑" : "新增";
  // Logo 链接
  const logoUrl = initialValues?.logo
    ? generateLogoUrl(initialValues.logo)
    : undefined;
  // Logo
  const [logoFile, setLogoFile] = useState<FileWithPreview["file"] | null>(
    null,
  );

  useEffect(() => {
    // 打开弹窗时重置，兜底避免上一次会话残留的 Logo 文件
    if (!wasOpenRef.current && state.isOpen) {
      setLogoFile(null);
    }
    if (wasOpenRef.current && !state.isOpen) {
      formRef?.current?.reset();
      setTags([]);
      setLogoFile(null);
      onClose?.();
    }
    wasOpenRef.current = state.isOpen;
  }, [state.isOpen, onClose, setTags]);

  // 上传成功回调
  const onSuccess = () => {
    state.close();
    toast.success("提交成功", {
      timeout: 2000,
      indicator: <CircleCheckFill />,
    });
    handleRefresh?.();
  };

  // 上传 Logo
  const { loading: uploadLoading, trigger: fetchUploadLogo } = useSwrMutation(
    "/websites/:id/logo",
    "PUT",
    {
      onSuccess: ({ code }) => {
        if (code === RESPONSE.SUCCESS) {
          onSuccess();
        }
      },
    },
  );

  // 保存表单
  const { loading, trigger } = useSwrMutation<Website>(
    "/websites",
    initialValues?.id ? "PUT" : "POST",
    {
      onSuccess: ({ code, data }) => {
        if (code === RESPONSE.SUCCESS) {
          if (data?.id && logoFile) {
            const formData = new FormData();

            formData.append("file", logoFile as File);
            fetchUploadLogo({ id: data.id, data: formData });
          } else {
            onSuccess();
          }
        }
      },
    },
  );

  // url
  const validateUrl = (value: string) => {
    if (!value) {
      return "请输入网站链接";
    }

    let url: URL;

    try {
      url = new URL(value);
    } catch {
      return "请输入合法的 URL";
    }

    if (url.protocol !== "https:") {
      return "网站链接必须以 https:// 开头";
    }

    const hostname = url.hostname;

    // 允许 IP（可选）
    const isIP =
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
      /^\[[0-9a-f:]+\]$/i.test(hostname); // IPv6

    // 至少包含一个点（example.com）
    const hasDot = hostname.includes(".");

    if (!hasDot && !isIP) {
      return "请输入有效的域名（如 https://example.com）";
    }

    return null;
  };

  // 表单提交
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: WebsiteSaveParams = {
      // string
      category_id: formData.get("category_id") as string,
      name: formData.get("name") as string,
      desc: (formData.get("desc") as string) ?? "",
      url: formData.get("url") as string,
      logo: (logoFile ? null : initialValues?.logo) ?? null,

      // number
      sort: Number(formData.get("sort")),

      // boolean（checkbox 选中才会存在）
      pinned: formData.has("pinned"),
      vpn: formData.has("vpn"),
      recommend: formData.has("recommend"),
      commonlyUsed: formData.has("commonlyUsed"),

      tags,
    };

    // 新增必须上传 Logo
    if (!initialValues && !logoFile) {
      toast.danger("请上传网站logo", {
        timeout: 2000,
        indicator: <Xmark />,
      });

      return;
    }
    await trigger({ id: initialValues?.id, data });
  };

  return (
    <Modal.Backdrop
      isKeyboardDismissDisabled
      isDismissable={false}
      isOpen={state.isOpen}
      onOpenChange={state.setOpen}
    >
      <Modal.Container placement="auto">
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
              <Globe className="size-5" />
            </Modal.Icon>
            <Modal.Heading>{`${actionText}网站`}</Modal.Heading>
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
                <Select
                  isRequired
                  aria-label="所属分类"
                  defaultValue={initialValues?.category_id ?? ""}
                  name="category_id"
                  placeholder="请选择所属分类"
                  variant="secondary"
                >
                  <Label>所属分类</Label>
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
                <TextField
                  isRequired
                  defaultValue={initialValues?.name ?? ""}
                  maxLength={100}
                  minLength={1}
                  name="name"
                  validate={(value) => {
                    if (!value) {
                      return "请输入网站名称";
                    }

                    return null;
                  }}
                >
                  <Label>网站名称</Label>
                  <Input
                    fullWidth
                    aria-label="网站名称"
                    placeholder="请输入网站名称"
                    variant="secondary"
                  />
                  <FieldError />
                </TextField>
                <TextField
                  isRequired
                  defaultValue={initialValues?.url ?? ""}
                  minLength={1}
                  name="url"
                  validate={validateUrl}
                >
                  <Label>网站链接</Label>
                  <Input
                    fullWidth
                    aria-label="网站链接"
                    placeholder="请输入网站链接"
                    variant="secondary"
                  />
                  <FieldError />
                </TextField>
                <div className="flex flex-col gap-1">
                  <Label isRequired htmlFor="logo">
                    Logo
                  </Label>
                  <LogoUpload
                    defaultAvatar={logoUrl}
                    onFileChange={(value) => setLogoFile(value?.file || null)}
                  />
                </div>
                <TagInputs value={tags} onChange={setTags} />
                <TextField
                  defaultValue={initialValues?.desc ?? ""}
                  maxLength={500}
                  name="desc"
                >
                  <Label>网站描述</Label>
                  <TextArea
                    fullWidth
                    aria-label="网站描述"
                    placeholder="请输入网站描述"
                    rows={3}
                    variant="secondary"
                  />
                </TextField>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="tags">网站属性</Label>
                  <SwitchGroup
                    className="overflow-x-auto"
                    orientation="horizontal"
                  >
                    {SwitchOptions.map(({ name, label }) => (
                      <Switch
                        key={name}
                        defaultSelected={get(initialValues, name, false)}
                        name={name}
                        value="on"
                      >
                        {({ isSelected }) => (
                          <Switch.Content>
                            <Switch.Control>
                              <Switch.Thumb>
                                <Switch.Icon>
                                  {isSelected ? (
                                    <Check className="size-3 text-inherit opacity-100" />
                                  ) : (
                                    <Xmark className="size-3 text-inherit opacity-70" />
                                  )}
                                </Switch.Icon>
                              </Switch.Thumb>
                            </Switch.Control>
                            {label}
                          </Switch.Content>
                        )}
                      </Switch>
                    ))}
                  </SwitchGroup>
                </div>
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
            <Button
              isDisabled={loading || uploadLoading}
              slot="close"
              variant="outline"
            >
              取消
            </Button>
            <Button
              form="category-form"
              isPending={loading || uploadLoading}
              type="submit"
            >
              {({ isPending }) => (
                <>
                  {isPending ? <Spinner color="current" size="sm" /> : null}
                  {loading
                    ? "正在提交..."
                    : uploadLoading
                      ? "正在上传 Logo..."
                      : "确定"}
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
