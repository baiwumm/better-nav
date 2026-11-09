import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getLoginErrorMessage,
  normalizeLoginError,
} from "../src/lib/auth-redirect.ts";

test("注册关闭时以 error_code 为准，不会被当成用户取消", () => {
  assert.equal(
    normalizeLoginError("access_denied", "signup_disabled"),
    "signup_disabled",
  );
});

test("裸 access_denied 视为用户取消授权", () => {
  assert.equal(normalizeLoginError("access_denied", null), "access_denied");
});

test("其余错误归为通用失败", () => {
  assert.equal(normalizeLoginError("server_error", null), "server_error");
  assert.equal(
    normalizeLoginError("access_denied", "user_banned"),
    "access_denied",
  );
});

test("无失败码不显示提示，已知失败码有专属文案", () => {
  assert.equal(getLoginErrorMessage(null), null);
  assert.equal(getLoginErrorMessage(""), null);
  assert.match(getLoginErrorMessage("signup_disabled") ?? "", /注册已关闭/);
});

test("未知失败码与原型属性名都回退到通用文案", () => {
  const generic = getLoginErrorMessage("server_error");

  assert.equal(getLoginErrorMessage("whatever"), generic);
  assert.equal(getLoginErrorMessage("toString"), generic);
  assert.equal(getLoginErrorMessage("__proto__"), generic);
});
