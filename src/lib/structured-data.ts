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

/** 分类页路径：内链、canonical、sitemap 与结构化数据共用同一处定义 */
export const categoryPath = (id: string) => `/c/${id}`;

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
        itemListElement: categories.map((category, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: category.name,
          url: `${APP_URL}${categoryPath(category.id)}`,
        })),
      },
    ],
  };
}

/**
 * @description: 分类页 JSON-LD：目录页 + 面包屑 + 站点清单。
 * 与页面可见内容一一对应，不声明页面上不存在的条目。
 */
export function buildCategoryJsonLd(category: Category) {
  const url = `${APP_URL}${categoryPath(category.id)}`;
  const websites = category.websites ?? [];
  const description = `收录 ${websites.length} 个「${category.name}」相关网站，由 ${APP_NAME} 人工整理分类。`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}/#webpage`,
        url,
        name: `${category.name}：${APP_SEO_KEYWORD}`,
        description,
        inLanguage: "zh-CN",
        isPartOf: { "@id": SITE_ID },
        mainEntity: { "@id": `${url}/#itemlist` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "首页",
            item: `${APP_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: category.name,
            item: url,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}/#itemlist`,
        name: `${category.name} 网站清单`,
        numberOfItems: websites.length,
        itemListElement: websites.map((website, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: website.name,
          url: website.url,
        })),
      },
    ],
  };
}
