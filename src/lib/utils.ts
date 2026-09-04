import type { IResponse } from "@/types";

/**
 * @description: 请求状态
 */
export const RESPONSE = {
  SUCCESS: 200,
  ERROR: 500,
} as const;

/**
 * Dynamically get a nested value from an array or
 * object with a string.
 *
 * @example get(person, 'friends[0].name')
 */
export function get<TDefault = unknown>(
  value: unknown,
  path: string,
  defaultValue?: TDefault,
): TDefault {
  const segments = path.split(/[.[\]]/g);
  let current: any = value;

  for (const key of segments) {
    if (current === null) return defaultValue as TDefault;
    if (current === undefined) return defaultValue as TDefault;
    const dequoted = key.replace(/['"]/g, "");

    if (dequoted.trim() === "") continue;
    current = current[dequoted];
  }
  if (current === undefined) return defaultValue as TDefault;

  return current;
}

/**
 * @description: 统一返回体
 */
export function responseMessage(
  data: unknown,
  msg: string = "请求成功",
  code: number = RESPONSE.SUCCESS,
): IResponse {
  return { data, msg, code, timestamp: Date.now() };
}

// 生成 Logo 链接
export const generateLogoUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET}/${path}`;

/**
 * @description: 格式化时间
 */
export function formatDate(
  value: string | number | Date,
  type: "date" | "datetime" = "date",
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(type === "datetime"
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  })
    .format(date)
    .replace(/\//g, "-");
}
