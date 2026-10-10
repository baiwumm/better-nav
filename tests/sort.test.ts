import test from "node:test";
import assert from "node:assert/strict";

import { sortWebsites } from "../src/lib/server/sort.ts";
import type { Website } from "../src/types/index.ts";

/**
 * 构造一个仅含排序字段的 Website 桩数据。
 * sortWebsites 只读 pinned / sort / recommend / created_at，其余字段对排序无影响。
 */
function makeSite(overrides: Partial<Website> & { id: string }): Website {
  return {
    name: `site-${overrides.id}`,
    desc: null,
    logo: null,
    url: "https://example.com",
    tags: [],
    pinned: false,
    vpn: false,
    recommend: false,
    visitCount: 0,
    commonlyUsed: false,
    category_id: "cat-1",
    category: {} as Website["category"],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    sort: 1,
    ...overrides,
  } as Website;
}

test("置顶站点永远排在非置顶之前", () => {
  const list = [
    makeSite({ id: "a", pinned: false, sort: 99 }),
    makeSite({ id: "b", pinned: true, sort: 1 }),
  ];

  assert.deepEqual(
    sortWebsites(list).map((s) => s.id),
    ["b", "a"],
  );
});

test("同为置顶时按 sort 降序", () => {
  const list = [
    makeSite({ id: "a", pinned: true, sort: 1 }),
    makeSite({ id: "b", pinned: true, sort: 5 }),
    makeSite({ id: "c", pinned: true, sort: 3 }),
  ];

  assert.deepEqual(
    sortWebsites(list).map((s) => s.id),
    ["b", "c", "a"],
  );
});

test("pinned 与 sort 都相同时按 recommend 降序", () => {
  const list = [
    makeSite({ id: "a", sort: 5, recommend: false }),
    makeSite({ id: "b", sort: 5, recommend: true }),
  ];

  assert.deepEqual(
    sortWebsites(list).map((s) => s.id),
    ["b", "a"],
  );
});

test("前三项都相同时按创建时间降序（新的在前）", () => {
  const list = [
    makeSite({ id: "old", created_at: "2026-01-01T00:00:00Z" }),
    makeSite({ id: "new", created_at: "2026-06-01T00:00:00Z" }),
    makeSite({ id: "mid", created_at: "2026-03-01T00:00:00Z" }),
  ];

  assert.deepEqual(
    sortWebsites(list).map((s) => s.id),
    ["new", "mid", "old"],
  );
});

test("完整优先级：pinned > sort > recommend", () => {
  const list = [
    makeSite({ id: "low-sort-rec", sort: 1, recommend: true }),
    makeSite({ id: "pinned-low-sort", pinned: true, sort: 1, recommend: false }),
    makeSite({ id: "high-sort-not-rec", sort: 5, recommend: false }),
  ];

  // pinned 战胜 sort；sort 战胜 recommend
  assert.deepEqual(
    sortWebsites(list).map((s) => s.id),
    ["pinned-low-sort", "high-sort-not-rec", "low-sort-rec"],
  );
});

test("空数组与单元素数组安全返回", () => {
  assert.deepEqual(sortWebsites([]), []);
  assert.equal(sortWebsites([makeSite({ id: "only" })])[0]?.id, "only");
});

test("不修改传入数组（toSorted 语义）", () => {
  const list = [
    makeSite({ id: "a", pinned: false }),
    makeSite({ id: "b", pinned: true }),
  ];
  const snapshot = list.map((s) => s.id);

  sortWebsites(list);

  // 原地排序的实现会让这里的断言失败，用于防止回归到 .sort()
  assert.deepEqual(
    list.map((s) => s.id),
    snapshot,
  );
});
