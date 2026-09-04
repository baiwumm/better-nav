/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2025-11-28 14:14:54
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-07-22 15:54:46
 * @Description: 全局 Loading
 */
"use client";
import type { FC, ReactNode } from "react";

import { Description, Spinner, useIsHydrated } from "@heroui/react";

interface FullLoadingProps {
  children: ReactNode;
}

const FullLoading: FC<FullLoadingProps> = ({ children }) => {
  const hydrated = useIsHydrated();

  // 判断组件是否挂载
  if (!hydrated) {
    return (
      <div className="fixed inset-0 flex w-screen h-screen justify-center items-center flex-col z-999 overflow-hidden bg-background">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <Description className="font-black">加载中,请稍后...</Description>
        </div>
      </div>
    );
  }

  return children;
};

export default FullLoading;
