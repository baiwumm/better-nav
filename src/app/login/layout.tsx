import type { Metadata } from "next";

// 登录页对搜索引擎无价值：由 noindex 排除，robots.txt 不屏蔽它（屏蔽后 noindex 读不到）
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
