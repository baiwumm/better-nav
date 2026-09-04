"use client";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import type { FC } from "react";

import { CircleXmarkFill, Picture, Xmark } from "@gravity-ui/icons";
import {
  Alert,
  Button,
  cn,
  Description,
  Surface,
  toast,
  useOverlayState,
} from "@heroui/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import CropLogoModal from "./crop-logo-modal";

import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";

interface LogoUploadProps {
  maxSize?: number;
  className?: string;
  onFileChange?: (file: FileWithPreview | null) => void;
  defaultAvatar?: string;
}

const LogoUpload: FC<LogoUploadProps> = ({
  maxSize = 1 * 1024 * 1024, // 1MB
  className,
  onFileChange,
  defaultAvatar,
}) => {
  const [innerFile, setInnerFile] = useState<FileWithPreview | null>(null);
  const cropModalState = useOverlayState();
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/*",
    multiple: false,
    onFilesChange: (files) => {
      const file = files[0];

      if (!file?.preview) return;
      setCropImage(file.preview);
      cropModalState.open();
    },
    onError: (errors) => {
      if (errors?.length) {
        toast.danger(errors[0], {
          timeout: 2000,
          indicator: <CircleXmarkFill />,
        });
      }
    },
  });

  const previewUrl = useMemo(
    () => innerFile?.preview ?? defaultAvatar,
    [innerFile, defaultAvatar],
  );

  // 保持最新的 onFileChange 引用，避免父组件重渲染导致重复通知
  const onFileChangeRef = useRef(onFileChange);

  useEffect(() => {
    onFileChangeRef.current = onFileChange;
  }, [onFileChange]);

  // ✅ 仅当 innerFile 变化时通知父组件。
  // 不能把 onFileChange 放进依赖：Modal 关闭动画期间父组件会因 onClose 重新渲染，
  // 产生新的 onFileChange 引用，此时 innerFile 仍是旧文件，会导致父组件 logoFile 被重新写回，残留到下一次编辑。
  useEffect(() => {
    onFileChangeRef.current?.(innerFile);
  }, [innerFile]);

  return (
    <>
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="relative">
          <div
            className={cn(
              "group/avatar relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/20",
              previewUrl && "border-solid",
            )}
            role="button"
            tabIndex={0}
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFileDialog();
              }
            }}
          >
            <input {...getInputProps()} className="sr-only" />

            {previewUrl ? (
              <Image
                fill
                alt="Logo"
                className="object-cover"
                src={previewUrl}
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Picture className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Remove Button - only show when file is uploaded */}
          {innerFile && (
            <Button
              isIconOnly
              aria-label="删除 Logo"
              className="absolute inset-e-0 top-0 size-6"
              size="sm"
              variant="outline"
              onPress={() => setInnerFile(null)}
            >
              <Xmark />
            </Button>
          )}
        </div>

        {/* Upload Instructions */}
        <Description className="text-center">
          请上传小于 {formatBytes(maxSize)} 的图片
        </Description>

        {/* Error Messages */}
        {errors.length > 0 && (
          <Surface className="w-full rounded-3xl p-4" variant="secondary">
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>上传失败</Alert.Title>
                <Alert.Description>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </Alert.Description>
              </Alert.Content>
            </Alert>
          </Surface>
        )}
      </div>
      <CropLogoModal
        image={cropImage}
        setInnerFile={setInnerFile}
        state={cropModalState}
      />
    </>
  );
};

export default LogoUpload;
