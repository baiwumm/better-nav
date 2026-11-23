import type { Category } from "@/types";

import { buildHomeJsonLd } from "@/lib/structured-data";

interface StructuredDataProps {
  /** 由 structured-data 里的构建函数生成的 JSON-LD 对象 */
  data: unknown;
}

/**
 * @description: JSON-LD 结构化数据。
 * 在服务端渲染进 HTML（不依赖客户端脚本），并把 `<` 转义，防止内容提前闭合 script 标签。
 */
export default function StructuredData({ data }: StructuredDataProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      dangerouslySetInnerHTML={{ __html: json }}
      type="application/ld+json"
    />
  );
}
