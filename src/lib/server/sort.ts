import type { Website } from "@/types";

/**
 * @description: 网站排序（原地排序，与 /api/categorys、首页保持一致）
 * 置顶 → sort 降序 → 推荐 → 创建时间降序
 */
export function sortWebsites(websites: Website[]) {
  return websites.sort((a, b) => {
    // 2. 再按 pinned 降序 (true 排在前面)
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;

    // 1. 先按 sort 降序 (b - a)
    if (b.sort !== a.sort) return b.sort - a.sort;

    // 3. 然后按 recommend 降序 (true 排在前面)
    if (a.recommend !== b.recommend) return b.recommend ? 1 : -1;

    // 4. 最后按 created_at 降序 (新日期在前)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
