import { revalidatePath } from "next/cache";

/**
 * @description: 公开页内容变更后失效缓存。
 *
 * 首页与 /c/[id] 都是 ISR 预渲染的，后台写完必须调用这里，否则页面会静默停在旧内容上。
 * 布局级失效覆盖首页与全部分类页，站点体量小，不做更细粒度的按需失效。
 */
export function revalidatePublicPages() {
  revalidatePath("/", "layout");
}
