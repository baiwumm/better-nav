/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-22 15:44:57
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-03 16:50:55
 * @Description: 用户头像
 */
import type { FC } from "react";

import { useRouter } from "@bprogress/next/app";
import { Person } from "@gravity-ui/icons";
import { Button, Spinner, Tooltip } from "@heroui/react";

import UserMenu from "@/components/UserMenu";
import { useSupabaseUser } from "@/hooks/use-supabase-user";

const UserAvatar: FC = () => {
  const router = useRouter();
  // 获取登录用户信息
  const { user, loading } = useSupabaseUser();

  return loading ? (
    <Spinner size="sm" />
  ) : user ? (
    <UserMenu user={user} />
  ) : (
    <Tooltip>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        onClick={() => router.push("/login")}
      >
        <Person />
      </Button>
      <Tooltip.Content showArrow>
        <Tooltip.Arrow />
        登录
      </Tooltip.Content>
    </Tooltip>
  );
};

export default UserAvatar;
