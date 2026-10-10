import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { RESPONSE, responseMessage } from "@/lib/utils";

/** 接受的最大请求体（字节），超出直接拒绝，避免被大 payload 打爆 */
const MAX_BODY_BYTES = 16 * 1024;

/**
 * @description: 接收客户端错误上报并写入服务端日志
 *
 * 这个端点是公开的（错误发生时用户可能未登录），因此只做最小校验 + 体量限制，
 * 不落库、不改状态。Vercel 会收集 console 输出为运行时日志，据此获得线上可观测性。
 */
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      responseMessage(null, "请求体过大", RESPONSE.ERROR),
      { status: 413 },
    );
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      responseMessage(null, "请求体不是合法 JSON", RESPONSE.ERROR),
      { status: 400 },
    );
  }

  const message =
    typeof payload.message === "string" ? payload.message : "未知客户端错误";

  // eslint-disable-next-line no-console -- 服务端日志即上报落点（Vercel 运行时日志收集 console 输出）
  console.error("[client-error]", {
    digest: typeof payload.digest === "string" ? payload.digest : undefined,
    message,
    stack: typeof payload.stack === "string" ? payload.stack : undefined,
    url: typeof payload.url === "string" ? payload.url : undefined,
    userAgent:
      typeof payload.userAgent === "string" ? payload.userAgent : undefined,
  });

  return NextResponse.json(responseMessage({ received: true }));
}
