import type { IResponse } from "@/types";

import { toast } from "@heroui/react";

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
}

const BASE_URL = "/api";

/** 请求超时（毫秒）。挂起的请求若不主动中断，loading 会一直转且没有任何反馈 */
const REQUEST_TIMEOUT = 15000;

export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<IResponse<T>> {
  const { params, signal: externalSignal, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  // 只有非 FormData 才设置 JSON
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const finalUrl = buildUrl(url, params);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  // 外部 signal（调用方主动取消）一并同步到内部 controller
  const forwardAbort = () => controller.abort();

  externalSignal?.addEventListener("abort", forwardAbort, { once: true });

  let response: Response;

  try {
    response = await fetch(finalUrl, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    // 调用方主动取消：原样抛出，不弹提示（这不是错误）
    if (externalSignal?.aborted) throw err;

    if (controller.signal.aborted) {
      const msg = `请求超时（${REQUEST_TIMEOUT / 1000}s），请检查网络后重试`;

      toast.danger(msg);
      throw new Error(msg);
    }

    // 网络层失败（断网 / DNS / CORS）在 fetch 阶段就抛出，HTTP 语义拿不到状态码，需单独提示
    const msg = `网络请求失败：${(err as Error).message || "请检查网络连接"}`;

    toast.danger(msg);
    throw new Error(msg);
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }

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
