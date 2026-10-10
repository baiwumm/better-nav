/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-10-09 10:00:00
 * @Description: 根布局错误边界
 *
 * 与 error.tsx 的区别：error.tsx 只捕获所在路由段的错误，根 layout.tsx 自身
 * （ThemeProvider / MotionConfig / Toast.Provider / 脚本注入）崩溃时仍需要一个
 * 能替换整个 <html> 的兜底页，否则用户面对的是浏览器默认白屏。
 */
"use client";
import type { FC } from "react";

import { Button } from "@heroui/react";
import { useEffect } from "react";

import { reportClientError } from "@/lib/report-error";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError: FC<GlobalErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    reportClientError(error, error?.digest);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-lg font-black">页面出错了</h1>
        <p className="text-sm text-muted text-center max-w-md">
          应用遇到了一个无法恢复的错误，请尝试重新加载。如果问题持续存在，请稍后再来。
        </p>
        <Button variant="danger" onPress={reset}>
          重新加载
        </Button>
      </body>
    </html>
  );
};

export default GlobalError;
