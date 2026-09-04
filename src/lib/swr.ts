import type { IResponse } from "@/types";
import type { Key, SWRConfiguration } from "swr";

import { request } from "@/lib/request";

/** 写操作参数：id 对应 URL 路径参数，data 对应请求体 */
export interface MutationArg {
  id?: string | number;
  data?: RequestPayload;
}

type RequestPayload = Record<string, unknown> | FormData;

/**
 * 构建写操作 mutation fetcher，等价原 useRequest.run 的 URL/body 拼装逻辑：
 * POST → body 为 data；PUT → URL 拼 id（支持 :id 占位符）+ body 为 data；DELETE → URL 拼 id
 */
export function buildMutationFetcher<T = unknown>(
  method: "POST" | "PUT" | "DELETE",
) {
  return async function mutationFetcher(
    url: string,
    { arg }: { arg?: MutationArg },
  ): Promise<IResponse<T>> {
    let requestUrl = url;
    let body: RequestPayload | undefined;

    switch (method) {
      case "PUT":
        requestUrl = url.includes(":id")
          ? url.replace(":id", String(arg?.id))
          : `${url}/${arg?.id}`;
        body = arg?.data;
        break;
      case "DELETE":
        requestUrl = `${url}/${arg?.id}`;
        break;
      case "POST":
        body = arg?.data;
        break;
    }

    return request<T>(requestUrl, {
      method,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
  };
}

/**
 * 查询 fetcher：swr 会把完整 key（字符串或数组原样）作为唯一参数传入 fetcher。
 * 数组 key 形如 ['/websites', { page: 1 }]，解构出 url 与查询参数后调用 request，
 * 返回 IResponse 的 data 字段
 */
export async function fetcher<T = unknown>(key: Key): Promise<T> {
  const [url, params] = Array.isArray(key) ? key : [key];
  const result = await request<T>(url as string, {
    method: "GET",
    params: params as Record<string, unknown> | undefined,
  });

  return result.data;
}

/** 全局 SWR 配置：平替现有行为（关闭窗口聚焦/断线重连自动刷新，失败不重试） */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
};
