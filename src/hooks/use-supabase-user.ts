/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-22 15:52:22
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-01-22 18:28:46
 * @Description: 获取用户登录信息
 */
"use client";
import type { User } from "@supabase/supabase-js";

import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useSupabaseUser() {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (mounted) {
        if (error) {
          setUser(null);
        } else {
          setUser(user);
        }
        setLoading(false);
      }
    };

    initUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}
