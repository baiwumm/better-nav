import test from "node:test";
import assert from "node:assert/strict";

import { formatBytes, formatDate, get, responseMessage } from "../src/lib/utils.ts";
import { RESPONSE } from "../src/lib/utils.ts";

test("formatBytes 常规单位换算", () => {
  assert.equal(formatBytes(0), "0 Bytes");
  assert.equal(formatBytes(1), "1Bytes");
  assert.equal(formatBytes(1024), "1KB");
  assert.equal(formatBytes(1536), "1.5KB");
  assert.equal(formatBytes(1048576), "1MB");
  assert.equal(formatBytes(2147483648), "2GB");
});

test("formatBytes 超出最大单位时收敛到 YB 而不是 undefined", () => {
  // 回归测试：修复前 sizes[i] 越界会产出 "NaN undefined"
  const huge = 10 ** 30;

  assert.equal(formatBytes(huge), "807.79YB");
  assert.ok(!formatBytes(huge).includes("undefined"));
  assert.ok(!formatBytes(Number.MAX_SAFE_INTEGER).includes("undefined"));
});

test("formatBytes 支持自定义小数位", () => {
  assert.equal(formatBytes(1536, 0), "2KB");
  assert.equal(formatBytes(1536, 4), "1.5KB");
});

test("get 支持点号路径与数组下标", () => {
  const data = { a: { b: [{ c: 1 }] } };

  assert.equal(get(data, "a.b.0.c"), 1);
  assert.equal(get(data, "a.b[0].c"), 1);
});

test("get 命中空值时返回默认值", () => {
  assert.equal(get({ a: null }, "a.b", "fallback"), "fallback");
  assert.equal(get(undefined, "a", 42), 42);
  assert.equal(get({}, "missing", "default"), "default");
});

test("responseMessage 默认值与显式入参", () => {
  const ok = responseMessage({ id: 1 });

  assert.equal(ok.code, RESPONSE.SUCCESS);
  assert.equal(ok.msg, "请求成功");
  assert.deepEqual(ok.data, { id: 1 });

  const bad = responseMessage(null, "坏了", RESPONSE.ERROR);

  assert.equal(bad.code, RESPONSE.ERROR);
  assert.equal(bad.msg, "坏了");
  assert.equal(bad.data, null);
});

test("formatDate 输出 yyyy-MM-dd 与 yyyy-MM-dd HH:mm（本地时间，无秒）", () => {
  // 用本地时间分量构造，避免用例随运行机器时区漂移
  const date = new Date(2026, 2, 5, 8, 9, 10);

  assert.equal(formatDate(date), "2026-03-05");
  assert.equal(formatDate(date, "datetime"), "2026-03-05 08:09");
});

test("formatDate 对非法日期返回空串", () => {
  assert.equal(formatDate("not-a-date"), "");
});
