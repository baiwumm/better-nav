"use client";
import type { MutationArg } from "@/lib/swr";
import type { IResponse } from "@/types";
import type { Key, SWRConfiguration } from "swr";
import type { SWRMutationConfiguration } from "swr/mutation";

import { useProgress } from "@bprogress/next";
import { useEffect } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { buildMutationFetcher, fetcher } from "@/lib/swr";

/**
 * 写操作 hook：平替原 useRequest(manual) 的 run，trigger({ id, data }) 等价原 run(id, data)
 * - loading = 请求进行中（等价原 loading）
 * - 进度条随请求开始/结束
 */
export function useSwrMutation<T = unknown>(
  key: string,
  method: "POST" | "PUT" | "DELETE",
  options?: SWRMutationConfiguration<
    IResponse<T>,
    unknown,
    string,
    MutationArg
  >,
) {
  const { start, stop } = useProgress();
  const result = useSWRMutation<IResponse<T>, unknown, string, MutationArg>(
    key,
    buildMutationFetcher<T>(method),
    options,
  );
  const { isMutating } = result;

  useEffect(() => {
    if (isMutating) start();
    else stop();
  }, [isMutating, start, stop]);

  return {
    ...result,
    loading: isMutating,
  };
}

/**
 * 查询 hook：平替原 useRequest 的 data/loading/mutate 语义
 * - loading = 首次加载或重新验证进行中（与原 useRequest 一致）
 * - 进度条随请求开始/结束
 */
export function useSwrQuery<T = unknown>(
  key: Key,
  options?: SWRConfiguration<T>,
) {
  const { start, stop } = useProgress();
  const result = useSWR<T>(key, fetcher, options);
  const { isValidating } = result;

  useEffect(() => {
    if (isValidating) start();
    else stop();
  }, [isValidating, start, stop]);

  return {
    ...result,
    loading: result.isLoading || isValidating,
  };
}
