/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-02-05 14:08:41
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-03 17:26:42
 * @Description: 站点卡片
 */
"use client";
import type { Website } from "@/types";
import type { FC } from "react";

import {
  BookmarkFill,
  CircleInfo,
  PinFill,
  ThumbsUpFill,
} from "@gravity-ui/icons";
import { Card, Chip, cn, Description, Tooltip } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateLogoUrl } from "@/lib/utils";

interface WebsiteCardProps {
  data: Website;
  /** 首屏图片预加载：首页视口内的卡片传 true */
  priority?: boolean;
}

const WebsiteCard: FC<WebsiteCardProps> = memo(({ data, priority = false }) => {
  const {
    id,
    name,
    desc,
    vpn,
    logo,
    tags,
    pinned,
    recommend,
    url,
    commonlyUsed,
  } = data || {};

  const handleClick = async () => {
    // 计数失败不影响跳转，且避免产生未处理的 Promise rejection
    try {
      await getSupabaseBrowserClient().rpc("increment_visit_count", {
        row_id: id,
      });
    } catch {
      // 忽略计数失败
    }
  };

  return (
    <Link href={url} target="_blank">
      <Card
        className={cn(
          "h-full transition-transform duration-300 hover:-translate-y-1.5 justify-between",
        )}
        onClick={handleClick}
      >
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            {logo ? (
              <div className="size-10 relative">
                <Image
                  fill
                  alt={name}
                  className="object-contain rounded-lg"
                  priority={priority}
                  src={generateLogoUrl(logo)}
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="text-base font-bold">{name}</div>
                {vpn ? (
                  <Tooltip delay={0}>
                    <Tooltip.Trigger aria-label="VPN">
                      <CircleInfo className="text-muted" />
                    </Tooltip.Trigger>
                    <Tooltip.Content showArrow>
                      <Tooltip.Arrow />
                      访问需要开启 VPN 服务
                    </Tooltip.Content>
                  </Tooltip>
                ) : null}
              </div>
              {tags?.length ? (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Chip key={tag} className="text-[10px]/4" variant="soft">
                      {tag}
                    </Chip>
                  ))}
                </div>
              ) : null}
            </div>
          </Card.Title>
          {desc ? (
            <Card.Description className="text-xs overflow-hidden line-clamp-2 wrap-break-word mt-1">
              {desc}
            </Card.Description>
          ) : null}
        </Card.Header>
        <Card.Footer className="flex justify-end">
          <div className="flex items-center gap-2 text-xs text-muted">
            {/* 置顶 */}
            {pinned ? (
              <div className="flex items-center gap-0.5">
                <PinFill className="size-3" />
                <Description>置顶</Description>
              </div>
            ) : null}
            {/* 推荐 */}
            {recommend ? (
              <div className="flex items-center gap-0.5">
                <ThumbsUpFill className="size-3" />
                <Description>推荐</Description>
              </div>
            ) : null}
            {/* 常用 */}
            {commonlyUsed ? (
              <div className="flex items-center gap-0.5">
                <BookmarkFill className="size-3" />
                <Description>常用</Description>
              </div>
            ) : null}
          </div>
        </Card.Footer>
      </Card>
    </Link>
  );
});

WebsiteCard.displayName = "WebsiteCard";
export default WebsiteCard;
