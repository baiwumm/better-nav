/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-08-10 10:00:00
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-10-09 10:00:00
 * @Description: 首页错误边界
 */
"use client";
import { useEffect } from "react";

import ErrorContent from "@/components/ErrorContent";
import { reportClientError } from "@/lib/report-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  // 生产环境把错误抛给后端记录，此前这里的 error 被整体丢弃，线上崩溃无迹可查
  useEffect(() => {
    reportClientError(error, error?.digest);
  }, [error]);

  return <ErrorContent refresh={reset} />;
}
