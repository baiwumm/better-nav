import type { Metadata } from "next";

// 登录页不参与索引（robots.txt 之外再加一层 meta noindex）
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
