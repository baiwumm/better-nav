/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-11-23 11:00:00
 * @Description: 分类页（可收录的分类落地页）
 */
import type { Metadata } from "next";
import type { Category } from "@/types";

import { Typography } from "@heroui/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import StructuredData from "@/components/StructuredData";
import WebsiteCard from "@/components/WebSiteCard";
import { fetchHomeData } from "@/lib/server/home";
import { APP_NAME, APP_SEO_KEYWORD, OG_IMAGE_URL } from "@/lib/site";
import { buildCategoryJsonLd, categoryPath } from "@/lib/structured-data";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

// 与首页一致：后台写操作通过 revalidatePath 主动失效
export const revalidate = 60;

/** 构建期预渲染现有分类；之后新增的分类由首次访问按需生成 */
export async function generateStaticParams() {
  try {
    const categories = await fetchHomeData();

    return categories.map(({ id }) => ({ id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await findCategory(id);

  // 不存在的分类交给 404，不参与索引
  if (!category) {
    return { robots: { index: false, follow: false } };
  }

  const title = `${category.name}：${APP_SEO_KEYWORD}`;
  const description = `收录 ${category.websites?.length ?? 0} 个「${category.name}」相关网站，由 ${APP_NAME} 人工整理分类，打开就能用。`;

  return {
    title,
    description,
    alternates: { canonical: categoryPath(category.id) },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: categoryPath(category.id),
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = await findCategory(id);

  if (!category) {
    notFound();
  }

  const websites = category.websites ?? [];

  return (
    <div className="flex flex-col gap-4">
      <nav
        aria-label="面包屑"
        className="text-muted flex items-center gap-2 text-sm"
      >
        <Link className="hover:text-accent transition-colors" href="/">
          首页
        </Link>
        <span aria-hidden="true">/</span>
        <span>{category.name}</span>
      </nav>
      {/* 页面级唯一 h1：与 title 主词一致，站点卡片标题仍是 h3 */}
      <div className="flex flex-col gap-1">
        <Typography className="text-xl font-black tracking-normal" type="h1">
          {category.name}
        </Typography>
        <Typography color="muted" type="body-sm">
          收录 {websites.length} 个「{category.name}」相关站点，由 {APP_NAME}{" "}
          人工整理分类，打开就能用。
        </Typography>
      </div>
      {websites.length ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]">
          {websites.map((item, index) => (
            <WebsiteCard key={item.id} data={item} priority={index < 4} />
          ))}
        </div>
      ) : (
        <Typography color="muted" type="body-sm">
          该分类下还没有站点，可以先回
          <Link className="hover:text-accent transition-colors" href="/">
            首页
          </Link>
          看看其他分类。
        </Typography>
      )}
      <StructuredData data={buildCategoryJsonLd(category)} />
    </div>
  );
}

/** 分类数据与首页共用同一份缓存查询，不额外打库 */
async function findCategory(id: string) {
  const categories = await fetchHomeData();

  return categories.find((category: Category) => category.id === id) ?? null;
}
