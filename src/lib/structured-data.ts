import type { Category } from "@/types";

import { AUTHOR_HANDLE, AUTHOR_SITE_URL } from "@/lib/author";
import {
  APP_NAME,
  APP_SEO_DESC,
  APP_SEO_KEYWORD,
  APP_SEO_TITLE,
  APP_URL,
} from "@/lib/site";

const SITE_ID = `${APP_URL}/#website`;
const PERSON_ID = `${APP_URL}/#person`;
const PAGE_ID = `${APP_URL}/#webpage`;
const LIST_ID = `${APP_URL}/#itemlist`;

/**
 * @description: 首页 JSON-LD。
 *
 * 只声明页面上真实存在的东西（站点、作者、目录页、分类清单）：
 * FAQPage / HowTo / SearchAction 的富结果已分别于 2026-05 / 2023-09 / 2024-11 退役，
 * 为它们写标记拿不到任何 Google 展示位，不要加。
 */
export function buildHomeJsonLd(categories: Category[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: `${APP_URL}/`,
        name: APP_NAME,
        alternateName: [APP_SEO_KEYWORD, APP_SEO_TITLE],
        description: APP_SEO_DESC,
        inLanguage: "zh-CN",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: AUTHOR_HANDLE,
        url: AUTHOR_SITE_URL,
        sameAs: [`https://github.com/${AUTHOR_HANDLE}`],
      },
      {
        "@type": "CollectionPage",
        "@id": PAGE_ID,
        url: `${APP_URL}/`,
        name: APP_SEO_TITLE,
        description: APP_SEO_DESC,
        inLanguage: "zh-CN",
        isPartOf: { "@id": SITE_ID },
        mainEntity: { "@id": LIST_ID },
      },
      {
        "@type": "ItemList",
        "@id": LIST_ID,
        name: "常用网址分类",
        numberOfItems: categories.length,
        // 目前分类没有独立页面，只能指向首页锚点；拆出 /c/[slug] 后改为分类页 URL
        itemListElement: categories.map((category, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: category.name,
          url: `${APP_URL}/#cat-${category.id}`,
        })),
      },
    ],
  };
}
