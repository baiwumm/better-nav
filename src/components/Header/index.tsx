/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-21 17:57:28
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-05 15:04:06
 * @Description: 顶部导航
 */
"use client";
import type { FC, ReactNode } from "react";

import { HouseFill, LogoGithub } from "@gravity-ui/icons";
import { Button, Tooltip } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import { ShimmeringText } from "@/components/ShimmeringText";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import TimeAndLunar from "@/components/TimeAndLunar";
import UserAvatar from "@/components/UserAvatar";
import pkg from "#/package.json";

interface Social {
  name: string;
  url: string;
  icon: ReactNode;
}

const socials: Social[] = [
  {
    name: "GitHub",
    url: pkg.git.url,
    icon: <LogoGithub />,
  },
];

const Header: FC = () => {
  return (
    <header className="shrink-0 sticky top-0 p-4 z-20 backdrop-blur-sm container mx-auto flex justify-between items-center">
      {/* 左侧 Logo */}
      <Link href="/">
        <div className="flex gap-2 items-center justify-self-start">
          <div className="size-8 relative">
            <Image
              fill
              alt="Logo"
              className="object-contain dark:hidden"
              src="/logo.svg"
            />
            <Image
              fill
              alt="Logo"
              className="hidden object-contain dark:block"
              src="/logo-dark.svg"
            />
          </div>
          <ShimmeringText
            className="text-xl font-black"
            color="var(--foreground)"
            duration={1.5}
            repeatDelay={1}
            shimmerColor="var(--background)"
            text={process.env.NEXT_PUBLIC_APP_NAME!}
          />
        </div>
      </Link>
      <TimeAndLunar />
      {/* 右侧区域 */}
      <div className="flex items-center gap-2 justify-self-end">
        <ThemeSwitcher />
        {socials.map(({ name, url, icon }) => (
          <Tooltip key={name} delay={0}>
            <Tooltip.Trigger>
              <Link aria-label={name} href={url} target="_blank">
                <Button isIconOnly size="sm" variant="ghost">
                  {icon}
                </Button>
              </Link>
            </Tooltip.Trigger>
            <Tooltip.Content showArrow offset={8} placement="bottom">
              <Tooltip.Arrow />
              {name}
            </Tooltip.Content>
          </Tooltip>
        ))}
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Link aria-label="主页" href={pkg.author.url} target="_blank">
              <Button isIconOnly size="sm" variant="ghost">
                <HouseFill />
              </Button>
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Content showArrow offset={8} placement="bottom">
            <Tooltip.Arrow />
            个人主页
          </Tooltip.Content>
        </Tooltip>
        {/* 登录用户信息 */}
        <UserAvatar />
      </div>
    </header>
  );
};

export default memo(Header);
