/** Logo 大小上限：2MB（与服务端校验、LogoUpload 客户端提示保持一致） */
export const MAX_LOGO_SIZE = 2 * 1024 * 1024;

/**
 * @description: 校验 Logo 文件：仅允许 image/* 格式，且不超过 2MB
 * @returns 校验失败原因，null 表示通过
 */
export function validateLogoFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Logo 仅支持图片格式（image/*）";
  }

  if (file.size > MAX_LOGO_SIZE) {
    return "Logo 大小不能超过 2MB";
  }

  return null;
}

/**
 * @description: 生成 Logo 存储路径：{uid}/{siteId}/{uuid}.{ext}
 * @description: 目录结构与 DELETE /api/websites/[id] 的清理逻辑保持一致
 */
export function buildLogoPath(uid: string, siteId: string, file: File): string {
  const ext = file.name.split(".").pop() || "png";

  return `${uid}/${siteId}/${crypto.randomUUID()}.${ext}`;
}
