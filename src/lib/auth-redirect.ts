/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-11-09 12:00:00
 * @Description: OAuth 登录失败码与提示文案（/auth/callback 路由与登录页共用）
 */

/** 回跳登录页时 ?error= 的取值 */
export type LoginErrorCode =
  "signup_disabled" | "access_denied" | "server_error";

const GENERIC_LOGIN_ERROR = "登录失败，请稍后再试。";

// 用 Map 而不是对象：?error= 来自 URL，对象查表会命中 toString 这类原型属性
const LOGIN_ERROR_MESSAGES = new Map<string, string>([
  ["signup_disabled", "本站注册已关闭，仅限受邀账号登录。"],
  ["access_denied", "你取消了授权，未完成登录。"],
]);

/**
 * @description: 把回调携带的错误参数归一化为失败码。
 * 注册关闭时 Supabase 返回 error=access_denied + error_code=signup_disabled，
 * 与用户取消授权的 error 相同，真实原因只体现在 error_code
 */
export function normalizeLoginError(
  error: string | null,
  errorCode: string | null,
): LoginErrorCode {
  if (errorCode === "signup_disabled") {
    return "signup_disabled";
  }

  return error === "access_denied" ? "access_denied" : "server_error";
}

/**
 * @description: 取失败码对应的提示文案，无失败码返回 null，未知失败码按通用失败处理
 */
export function getLoginErrorMessage(code: string | null): string | null {
  if (!code) {
    return null;
  }

  return LOGIN_ERROR_MESSAGES.get(code) ?? GENERIC_LOGIN_ERROR;
}
