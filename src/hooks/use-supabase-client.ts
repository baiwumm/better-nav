/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-10-09 10:00:00
 * @Description: 浏览器端 Supabase 客户端（模块级单例）
 */
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";

import { useMemo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// 模块级缓存：整个应用复用同一个客户端。
// 若每次渲染都调用 getSupabaseBrowserClient()，放在 useEffect 依赖数组里会导致
// 每次渲染都重新 getUser()（网络请求）并重新注册 onAuthStateChange 订阅。
let cachedClient: SupabaseClient | undefined;

function getCachedClient() {
  if (!cachedClient) {
    cachedClient = getSupabaseBrowserClient();
  }

  return cachedClient;
}

export function useSupabaseClient(): SupabaseClient {
  return useMemo(() => getCachedClient(), []);
}
