import "./globals.css";

import type { Metadata, Viewport } from "next";

import { Toast } from "@heroui/react";
import { Analytics } from "@vercel/analytics/next";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

import Provider from "./Provider";

import { GoogleUtilities, MicrosoftClarity } from "@/components/Analytics";
import Footer from "@/components/Footer";
import { AUTHOR_HANDLE } from "@/lib/author";
import pkg from "#/package.json";
import {
  APP_KEYWORDS,
  APP_NAME,
  APP_SEO_DESC,
  APP_SEO_TITLE,
  APP_URL,
  BING_SITE_VERIFICATION,
  GOOGLE_SITE_VERIFICATION,
  OG_IMAGE_URL,
} from "@/lib/site";

// Logo 全部走 Supabase Storage，提前建连，避免几十张卡片图标逐个握手
const SUPABASE_ORIGIN = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  /\/$/,
  "",
);

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  // default 是首页 SERP 标题（主词前置）；子页面用 template 继承品牌
  title: {
    default: APP_SEO_TITLE,
    template: `%s｜${APP_NAME}`,
  },
  description: APP_SEO_DESC,
  keywords: APP_KEYWORDS,
  authors: [{ name: AUTHOR_HANDLE, url: pkg.author.url }],
  creator: AUTHOR_HANDLE,
  publisher: AUTHOR_HANDLE,
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: APP_SEO_TITLE,
    description: APP_SEO_DESC,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: APP_SEO_TITLE,
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_SEO_TITLE,
    description: APP_SEO_DESC,
    creator: "baiwumm",
    images: [OG_IMAGE_URL],
  },
  manifest: `${APP_URL}/manifest.json`,
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": BING_SITE_VERIFICATION,
    },
  },
};

export const viewport: Viewport = {
  // 与 manifest.json 的 theme_color 保持一致
  themeColor: "#f6f5f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head>
        {SUPABASE_ORIGIN ? (
          <link crossOrigin="" href={SUPABASE_ORIGIN} rel="preconnect" />
        ) : null}
        <meta content={pkg.version} name="version" />
        <meta content={APP_NAME} name="apple-mobile-web-app-title" />
        {/* Google 统计 */}
        <GoogleUtilities />
        {/* 微软统计 */}
        <MicrosoftClarity />
        {/* Vercel 分析 */}
        <Analytics />
      </head>
      <body className="bg-background text-foreground flex min-h-screen flex-col">
        <ThemeProvider attribute="class" enableSystem={false}>
          <MotionConfig reducedMotion="user">
            {/* Footer 是异步服务端组件，在服务端渲染后作为 slot 传入客户端 Provider，
                避免 GitHub 请求落到浏览器（会触发 CORS 且暴露调用侧） */}
            <Provider footer={<Footer />}>{children}</Provider>
            <Toast.Provider placement="top" />
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
