/**
 * 一次性迁移脚本：把历史裸版本号 tag（如 3.10.4）改为 v 前缀（v3.10.4），GitHub Release 一并改绑。
 *
 * 背景：tag 自 v3.10.5 起由 .release-it.json 的 git.tagName 锁定为 v 前缀，此脚本负责历史存量，
 * 跑完后可删除（保留亦可，幂等设计，重复执行自动跳过已完成项）。
 *
 * 执行顺序（不可调换）：
 *   1. 为每个裸 tag 在本地创建 v 前缀 tag（annotated tag 保留原说明文字重新签名，lightweight 保持
 *      lightweight），确认无冲突后批量推送到 origin；
 *   2. 把绑在裸 tag 上的 GitHub Release 改绑到 v tag（tag_name / 标题 "Release X.Y.Z" →
 *      "Release vX.Y.Z" / 正文 compare 链接 3.10.2...3.10.3 → v3.10.2...v3.10.3）；
 *      注意必须先推送 v tag 再改绑，否则 GitHub Release 会按 target_commitish 重建出错误的 tag；
 *   3. 删除远程裸 tag，再删除本地裸 tag（先删远程后删本地无实际约束，仅为对称）。
 *
 * 用法：
 *   node scripts/migrate-tags.mjs --dry-run   # 只预览将要执行的操作，不做任何改动
 *   node scripts/migrate-tags.mjs             # 正式执行（依赖 gh 已登录且对仓库有写权限）
 *
 * 注意：
 *   · 迁移期间不要发版；
 *   · 删除远程 tag 后，旧 Release 的 permalink（/releases/tag/3.10.4）会失效（无重定向），
 *     Release 列表页仍完整；
 *   · tag 改名不会触发 Vercel 部署（Vercel 只跟 main 分支 push）；
 *   · 重建的 annotated tag 的 tagger 为当前 git 用户与当前时间，原 tagger 日期不保留；
 *   · 无 Release 的裸 tag（共 4 个）只做 tag 改名，第 2 步自动跳过。
 */
import { spawnSync } from "node:child_process";

const DRY_RUN = process.argv.includes("--dry-run");
const TAG_RE = /^\d+\.\d+\.\d+$/;
const PUSH_CHUNK = 40;

/** 执行 shell 命令；capture 返回 stdout，quiet 静默失败（如查询不存在的 Release） */
function sh(cmd, { input, quiet } = {}) {
  const res = spawnSync(cmd, {
    shell: true,
    input,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.status !== 0 && !quiet) {
    console.error(`命令失败（exit ${res.status}）：${cmd}`);
    if (res.stderr) {
      console.error(res.stderr);
    }
    process.exit(1);
  }

  return res;
}

const shOut = (cmd, opts) => sh(cmd, opts).stdout.trim();
const run = (cmd, opts) => sh(cmd, opts);

const versionTuple = (tag) => tag.split(".").map(Number);
const compareVersion = (a, b) => {
  const [x, y] = [versionTuple(a), versionTuple(b)];

  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
const fixCompareLinks = (text) =>
  text.replace(
    /(\/compare\/)(\d+\.\d+\.\d+)\.\.\.(\d+\.\d+\.\d+)/g,
    "$1v$2...v$3",
  );
const fixReleaseName = (name, bare) => {
  if (name === bare) {
    return `v${bare}`;
  }
  if (name === `Release ${bare}`) {
    return `Release v${bare}`;
  }

  return name;
};

// ── 仓库身份确认 ────────────────────────────────────────────────
const originUrl = shOut("git remote get-url origin");
const repo = originUrl.match(
  /github\.com[:/](?<owner>[\w.-]+)\/(?<name>[\w.-]+?)(?:\.git)?$/,
)?.groups;

if (!repo) {
  console.error(`无法从 origin 解析 GitHub 仓库：${originUrl}`);

  process.exit(1);
}
const ghRepo = `${repo.owner}/${repo.name}`;
console.log(`仓库：${ghRepo}${DRY_RUN ? "（dry-run 预览，不做任何改动）" : ""}\n`);

// ── 同步远程 tag 到本地，确定迁移清单 ────────────────────────────
run("git fetch origin --tags --force --quiet");

const remoteTags = shOut("git ls-remote --tags origin")
  .split("\n")
  .map((line) => line.split("\t")[1]?.replace(/^refs\/tags\//, ""))
  .filter((ref) => ref && !ref.endsWith("^{}"));
const bareTags = remoteTags.filter((tag) => TAG_RE.test(tag)).sort(compareVersion);
const vTags = new Set(remoteTags.filter((tag) => /^v/.test(tag)));
const untouched = remoteTags.filter((tag) => !TAG_RE.test(tag) && !tag.startsWith("v"));

if (untouched.length > 0) {
  console.log(`以下 tag 不符合 bare semver 格式，保持不动：${untouched.join(", ")}\n`);
}
if (bareTags.length === 0) {
  console.log("没有需要迁移的裸版本号 tag，结束。");

  process.exit(0);
}
console.log(`待迁移裸 tag 共 ${bareTags.length} 个：${bareTags[0]} … ${bareTags.at(-1)}\n`);

// ── 第 1 步：本地创建 v 前缀 tag（保留 annotated 说明文字） ───────
let created = 0;

for (const tag of bareTags) {
  const vTag = `v${tag}`;

  if (vTags.has(vTag)) {
    console.log(`跳过 ${tag}：${vTag} 已存在于远程`);

    continue;
  }
  const oid = shOut(`git rev-parse "${tag}^{commit}"`);
  const objType = shOut(`git cat-file -t ${tag}`);

  if (DRY_RUN) {
    console.log(`[dry-run] 将创建 ${vTag}（${objType}）← ${tag} @ ${oid.slice(0, 7)}`);

    continue;
  }
  if (objType === "tag") {
    // annotated：以原说明文字重建 annotated tag（tagger 为当前 git 用户）
    const message = shOut(`git for-each-ref refs/tags/${tag} --format=%(contents)`);

    run(`git tag -a ${vTag} -F - ${oid}`, { input: `${message}\n` });
  } else {
    // lightweight：直接指向同一提交
    run(`git tag ${vTag} ${oid}`);
  }
  created += 1;
}

if (!DRY_RUN && created > 0) {
  for (const tags of chunk(bareTags.map((tag) => `v${tag}`), PUSH_CHUNK)) {
    run(`git push origin ${tags.join(" ")}`);
  }
  console.log(`\n已创建并推送 ${created} 个 v 前缀 tag。`);
}

// ── 第 2 步：GitHub Release 改绑到 v tag ────────────────────────
let rebound = 0;
let noRelease = 0;

for (const tag of bareTags) {
  const res = sh(`gh api repos/${ghRepo}/releases/tags/${tag}`, { quiet: true });

  if (res.status !== 0) {
    noRelease += 1;

    continue;
  }
  const release = JSON.parse(res.stdout);
  const nextTag = `v${tag}`;
  const nextName = fixReleaseName(release.name ?? "", tag);
  const nextBody = fixCompareLinks(release.body ?? "");
  const needPatch =
    release.tag_name !== nextTag ||
    release.name !== nextName ||
    release.body !== nextBody;

  if (!needPatch) {
    console.log(`跳过 ${nextTag} 的 Release：已是 v 格式`);

    continue;
  }

  if (DRY_RUN) {
    console.log(
      `[dry-run] 将改绑 Release #${release.id}「${release.name}」→ tag ${nextTag}` +
        `${nextName !== release.name ? `，标题改为「${nextName}」` : ""}` +
        `${nextBody !== release.body ? "，正文 compare 链接加 v 前缀" : ""}`,
    );

    continue;
  }
  run(`gh api -X PATCH repos/${ghRepo}/releases/${release.id} --input -`, {
    input: JSON.stringify({
      tag_name: nextTag,
      name: nextName,
      body: nextBody,
    }),
  });
  rebound += 1;
}

if (!DRY_RUN) {
  console.log(`\nRelease 改绑完成：${rebound} 个更新，${noRelease} 个裸 tag 无 Release（跳过）。`);
}

// ── 第 3 步：删除远程与本地裸 tag ───────────────────────────────
if (DRY_RUN) {
  console.log(`\n[dry-run] 将删除远程裸 tag ${bareTags.length} 个及对应本地 tag。`);

  process.exit(0);
}
for (const tags of chunk(bareTags, PUSH_CHUNK)) {
  run(`git push origin --delete ${tags.join(" ")}`);
}
run(`git tag -d ${bareTags.join(" ")}`);

const remain = shOut("git ls-remote --tags origin")
  .split("\n")
  .map((line) => line.split("\t")[1]?.replace(/^refs\/tags\//, ""))
  .filter((ref) => ref && !ref.endsWith("^{}") && TAG_RE.test(ref));

if (remain.length > 0) {
  console.error(`警告：远程仍残留裸 tag：${remain.join(", ")}`);

  process.exit(1);
}
console.log(`\n迁移完成：远程 tag 已全部为 v 前缀，可执行后续 CHANGELOG 链接重写与提交。`);
