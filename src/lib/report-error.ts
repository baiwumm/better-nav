/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-10-09 10:00:00
 * @Description: 客户端错误上报
 *
 * 错误边界（error.tsx / global-error.tsx）此前只把 error 丢掉，生产环境崩了只能靠用户反馈。
 * 这里把错误 POST 到自家 /api/client-errors，由服务端写日志——Vercel 会收集运行时日志，
 * 等于零依赖获得最小可用的线上可观测性。后续要接 Sentry 只需改这一个文件。
 */
"use client";

interface ClientErrorPayload {
  message: string;
  digest?: string;
  stack?: string;
  url: string;
  userAgent: string;
}

/** 单次上报的字节上限，防止异常大的 stack 把请求体撑爆 */
const MAX_PAYLOAD_BYTES = 8 * 1024;

/** 同一会话内同一错误的去重窗口，避免错误边界重复触发时刷屏 */
const DEDUPE_WINDOW_MS = 60_000;

const reportedAt = new Map<string, number>();

function buildPayload(error: unknown, digest?: string): ClientErrorPayload {
  const err = error instanceof Error ? error : new Error(String(error));

  const payload: ClientErrorPayload = {
    message: err.message.slice(0, MAX_PAYLOAD_BYTES),
    digest,
    url: typeof location === "undefined" ? "" : location.href,
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
  };

  // stack 仅在 Error 实例上存在，且同样截断
  if (err.stack) {
    payload.stack = err.stack.slice(0, MAX_PAYLOAD_BYTES);
  }

  return payload;
}

/**
 * @description: 上报客户端错误；内部吞掉所有异常，上报失败绝不能再引发二次崩溃
 */
export function reportClientError(error: unknown, digest?: string): void {
  if (typeof window === "undefined") return;

  const payload = buildPayload(error, digest);
  const dedupeKey = `${payload.message}|${digest ?? ""}`;
  const now = Date.now();
  const last = reportedAt.get(dedupeKey);

  // 窗口内已报过同样的错误，直接跳过
  if (last && now - last < DEDUPE_WINDOW_MS) return;
  reportedAt.set(dedupeKey, now);

  const body = JSON.stringify(payload);

  // sendBeacon 在页面卸载时仍能发出，是错误上报的首选；不支持时退化为 fetch + keepalive
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(
        "/api/client-errors",
        new Blob([body], { type: "application/json" }),
      );

      return;
    } catch {
      // 落到下面的 fetch 分支
    }
  }

  void fetch("/api/client-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // 上报失败无恢复手段，静默忽略
  });
}
