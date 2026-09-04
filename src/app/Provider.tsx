/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-22 09:42:15
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 17:51:27
 * @Description: 上下文提供者
 */
"use client";
import type { FC, PropsWithChildren } from "react";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
import { useEffect, ViewTransition } from "react";
import { SWRConfig } from "swr";

import BackTop from "@/components/BackTop";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { swrConfig } from "@/lib/swr";

/** 后退方向标记保留时间，动画结束后清除，避免影响后续前进导航 */
const NAV_DIR_RESET_DELAY = 1000;

const Providers: FC<PropsWithChildren> = ({ children }) => {
  // 浏览器前进/后退会触发 popstate，此时标记「后退」让路由转场反向滑动；
  // 普通链接跳转（pushState）不触发 popstate，默认按「前进」处理
  useEffect(() => {
    const root = document.documentElement;
    let timer: number | undefined;
    const markBackward = () => {
      root.dataset.navDir = "backward";
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => delete root.dataset.navDir,
        NAV_DIR_RESET_DELAY,
      );
    };

    window.addEventListener("popstate", markBackward);

    return () => {
      window.removeEventListener("popstate", markBackward);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <ProgressProvider
      shallowRouting
      color="var(--accent)"
      options={{ showSpinner: true }}
    >
      <SWRConfig value={swrConfig}>
        {/* 顶部 */}
        <Header />
        {/* 主体内容 */}
        <ViewTransition name="blur-slide">
          <main className="flex-1 min-h-0 container mx-auto p-4 flex flex-col gap-4">
            {children}
          </main>
        </ViewTransition>
        {/* 底部版权 */}
        <Footer />
        <BackTop />
      </SWRConfig>
    </ProgressProvider>
  );
};

export default Providers;
