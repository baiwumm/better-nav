/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-08-10 10:00:00
 * @Description: 首页错误边界
 */
"use client";
import ErrorContent from "@/components/ErrorContent";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return <ErrorContent refresh={reset} />;
}
