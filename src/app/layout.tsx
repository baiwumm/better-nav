import "./globals.css";

import type { Metadata } from "next";

import { Toast } from "@heroui/react";
import { Analytics } from "@vercel/analytics/next";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

import Provider from "./Provider";

import { GoogleUtilities, MicrosoftClarity } from "@/components/Analytics";
import pkg from "#/package.json";
import {
  APP_DESC,
  APP_KEYWORDS,
  APP_NAME,
  APP_TITLE,
  APP_URL,
  AUTHOR_NAME,
  OG_IMAGE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: `${APP_TITLE} | ${APP_NAME}`,
  description: APP_DESC,
  keywords: APP_KEYWORDS,
  authors: [{ name: AUTHOR_NAME, url: pkg.author.url }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESC,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESC,
    creator: "baiwumm",
    images: [OG_IMAGE_URL],
  },
  manifest: `${APP_URL}/manifest.json`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <head>
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
            <Provider>{children}</Provider>
            <Toast.Provider placement="top" />
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
