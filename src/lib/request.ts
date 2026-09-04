import type { IResponse } from "@/types";

import { toast } from "@heroui/react";

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
}

const BASE_URL = "/api";

export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<IResponse<T>> {
  const { params, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  // 只有非 FormData 才设置 JSON
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const finalUrl = buildUrl(url, params);

  const response = await fetch(finalUrl, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const msg = `请求失败 ${response.status}`;

    toast.danger(msg);
    throw new Error(msg);
  }

  const result = (await response.json()) as IResponse<T>;

  if (result.code !== 200) {
    const msg = result.msg || "请求失败";

    toast.danger(msg);
  }

  return result;
}

function buildUrl(url: string, params?: Record<string, unknown>) {
  if (!params) {
    return `${BASE_URL}${url}`;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `${BASE_URL}${url}?${query}` : `${BASE_URL}${url}`;
}
