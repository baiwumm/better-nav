/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-11-09 15:30:00
 * @Description: 按候选链解析用户头像地址（预加载 + 失败降级）
 */
"use client";
import type { User } from "@supabase/supabase-js";

import { useEffect, useState } from "react";

import { getAvatarCandidates } from "@/lib/user-profile";

/**
 * @description: 返回第一个可加载的头像地址，全部不可达时返回 undefined
 * （由 Avatar.Fallback 展示占位图标）。
 * Radix 的 Avatar.Image 加载失败后不会重试，单次请求失败会让该实例永久停留在
 * 占位图标（header 头像与 dropdown 头像挂载时机不同，失败的那一侧就一直不显示），
 * 因此这里用 new Image() 自行预检，按候选链把不可达的域名平滑降级
 */
export function useUserAvatarUrl(user: User | null): string | undefined {
  // 候选链拼成字符串作为依赖：user 对象每次渲染都是新引用，按内容判断是否需要重新解析
  const candidatesKey = getAvatarCandidates(user).join("|");
  const [resolved, setResolved] = useState<string | undefined>(undefined);

  useEffect(() => {
    const candidates = candidatesKey ? candidatesKey.split("|") : [];
    let cancelled = false;
    let index = 0;

    const tryNext = () => {
      if (cancelled) {
        return;
      }

      const url = candidates[index];

      index += 1;

      if (!url) {
        setResolved(undefined);

        return;
      }

      const image = new Image();

      image.onload = () => {
        if (!cancelled) {
          setResolved(url);
        }
      };
      image.onerror = tryNext;
      image.src = url;
    };

    tryNext();

    return () => {
      cancelled = true;
    };
  }, [candidatesKey]);

  return resolved;
}
