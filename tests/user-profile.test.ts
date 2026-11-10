import assert from "node:assert/strict";
import { test } from "node:test";

import type { User } from "@supabase/supabase-js";

import {
  getAvatarCandidates,
  getUserDisplayName,
} from "../src/lib/user-profile.ts";

const GITHUB_AVATAR = "https://avatars.githubusercontent.com/u/40554571?v=4";
const GOOGLE_AVATAR =
  "https://lh3.googleusercontent.com/a/ACg8ocJplzPu0Q-J7dKwdRDU95ZRoNv-Ia0bpLPvszxI6DIvco38MDnA=s96-c";

/** 按 Supabase User 的形状构造最小测试数据 */
function makeUser(overrides: Record<string, unknown>): User {
  return {
    id: "u1",
    email: "me@baiwumm.com",
    user_metadata: {},
    identities: [],
    ...overrides,
  } as unknown as User;
}

test("GitHub 身份头像优先于登录资料头像", () => {
  const user = makeUser({
    user_metadata: { avatar_url: GOOGLE_AVATAR },
    identities: [
      { provider: "google", identity_data: { avatar_url: GOOGLE_AVATAR } },
      { provider: "github", identity_data: { avatar_url: GITHUB_AVATAR } },
    ],
  });

  assert.deepEqual(getAvatarCandidates(user), [
    GITHUB_AVATAR,
    GOOGLE_AVATAR,
    "/avatar.png",
  ]);
});

test("无 GitHub 身份时回退登录资料头像", () => {
  const user = makeUser({
    user_metadata: { avatar_url: GOOGLE_AVATAR },
    identities: [
      { provider: "google", identity_data: { avatar_url: GOOGLE_AVATAR } },
    ],
  });

  assert.deepEqual(getAvatarCandidates(user), [
    GOOGLE_AVATAR,
    "/avatar.png",
  ]);
});

test("远程头像都没有时只留本地兜底", () => {
  const user = makeUser({ user_metadata: {}, identities: [] });

  assert.deepEqual(getAvatarCandidates(user), ["/avatar.png"]);
});

test("候选去重：GitHub 头像与资料头像相同时只出现一次", () => {
  const user = makeUser({
    user_metadata: { avatar_url: GITHUB_AVATAR },
    identities: [{ provider: "github", identity_data: { avatar_url: GITHUB_AVATAR } }],
  });

  assert.deepEqual(getAvatarCandidates(user), [GITHUB_AVATAR, "/avatar.png"]);
});

test("展示名优先 GitHub 用户名，不取真名", () => {
  const user = makeUser({
    user_metadata: { name: "谢明伟", user_name: "baiwumm" },
  });

  assert.equal(getUserDisplayName(user), "baiwumm");
});

test("展示名回退链：用户名 → 资料名 → 邮箱首字符", () => {
  assert.equal(
    getUserDisplayName(makeUser({ user_metadata: { name: "谢明伟" } })),
    "谢明伟",
  );
  assert.equal(
    getUserDisplayName(makeUser({ user_metadata: {}, email: "me@baiwumm.com" })),
    "m",
  );
  assert.equal(getUserDisplayName(null), "");
});
