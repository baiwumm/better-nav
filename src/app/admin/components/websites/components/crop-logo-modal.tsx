/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-07-07 16:40:51
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-07-07 17:48:24
 * @Description: Logo 裁剪弹窗
 */
"use client";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import type { UseOverlayStateReturn } from "@heroui/react";
import type { Dispatch, FC, SetStateAction } from "react";
import type { Area, Point } from "react-easy-crop";

import { Crop } from "@gravity-ui/icons";
import { Button, Modal } from "@heroui/react";
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

import { getCroppedImg } from "@/lib/crop-image";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

interface CropLogoModalProps {
  state: UseOverlayStateReturn;
  image: string | null;
  setInnerFile: Dispatch<SetStateAction<FileWithPreview | null>>;
}

const CropLogoModal: FC<CropLogoModalProps> = ({
  state,
  image,
  setInnerFile,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mediaSize, setMediaSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // 读取图片原始宽高，让裁剪框跟随原图比例，避免非正方形 Logo 裁剪不全
  // image 为 null 时不渲染 Cropper（见下方条件渲染），无需在 effect 中同步重置状态
  useEffect(() => {
    if (!image) return;
    const img = new Image();

    img.onload = () =>
      setMediaSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = image;
  }, [image]);

  const aspect = mediaSize ? mediaSize.width / mediaSize.height : 1;

  /**
   * @description: 裁剪完成
   */
  function onCropComplete(_: Area, croppedPixels: Area) {
    setCroppedAreaPixels(croppedPixels);
  }

  /**
   * @description: 确认裁剪
   */
  const handleCropConfirm = async () => {
    if (!image || !croppedAreaPixels) return;
    const file = await getCroppedImg(image, croppedAreaPixels);
    const preview = URL.createObjectURL(file);
    const newFile: FileWithPreview = {
      id: crypto.randomUUID(),
      file,
      preview,
    };

    setInnerFile(newFile);
    state.close();
  };

  const onReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
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
              <Crop className="size-5" />
            </Modal.Icon>
            <Modal.Heading>Logo 裁剪</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="py-4 px-1">
            <div className="relative h-100">
              {image && mediaSize && (
                <Cropper
                  aspect={aspect}
                  crop={crop}
                  image={image}
                  maxZoom={MAX_ZOOM}
                  minZoom={MIN_ZOOM}
                  rotation={rotation}
                  zoom={zoom}
                  zoomSpeed={ZOOM_STEP}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onRotationChange={setRotation}
                  onZoomChange={setZoom}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="outline">
              取消
            </Button>
            <Button variant="tertiary" onPress={onReset}>
              重置
            </Button>
            <Button onPress={handleCropConfirm}>确认</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default CropLogoModal;
