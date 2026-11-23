import type { Category } from "@/types";

import { buildHomeJsonLd } from "@/lib/structured-data";

interface StructuredDataProps {
  categories: Category[];
}

/**
 * @description: JSON-LD 结构化数据。
 * 在服务端渲染进 HTML（不依赖客户端脚本），并把 `<` 转义，防止内容提前闭合 script 标签。
 */
export default function StructuredData({ categories }: StructuredDataProps) {
  const json = JSON.stringify(buildHomeJsonLd(categories)).replace(
    /</g,
    "\\u003c",
  );

  return (
    <script
      dangerouslySetInnerHTML={{ __html: json }}
      type="application/ld+json"
    />
  );
}
