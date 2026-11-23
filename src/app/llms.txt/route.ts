import { fetchHomeData } from "@/lib/server/home";
import { APP_NAME, APP_SEO_DESC, APP_URL } from "@/lib/site";
import { categoryPath } from "@/lib/structured-data";

/** 与 sitemap 同频更新即可 */
export const revalidate = 3600;

/**
 * @description: /llms.txt —— 给 AI 引擎的站点索引。
 *
 * 声明：Google 官方说明 AI Overviews 不需要这类文件，它的收益只来自
 * ChatGPT / Claude / Perplexity 这类会主动解析机器可读清单的引擎。
 */
export async function GET() {
  const lines = [
    `# ${APP_NAME}`,
    "",
    `> ${APP_SEO_DESC}`,
    "",
    "## 站点",
    "",
    `- [${APP_NAME} 首页](${APP_URL}/)：全部常用网址，按分类整理`,
    "",
  ];

  try {
    const categories = await fetchHomeData();

    for (const category of categories) {
      lines.push(
        `## ${category.name}`,
        "",
        `- 分类页面：${APP_URL}${categoryPath(category.id)}`,
      );

      for (const website of category.websites ?? []) {
        const summary = website.desc ? `：${website.desc}` : "";

        lines.push(`- [${website.name}](${website.url})${summary}`);
      }

      lines.push("");
    }
  } catch {
    lines.push("## 分类", "", "当前无法读取分类数据，请直接访问首页。", "");
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
