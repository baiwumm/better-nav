import type { User } from "@supabase/supabase-js";
import type { FC, Key } from "react";

import { useRouter } from "@bprogress/next/app";
import {
  ArrowRightFromSquare,
  CircleXmarkFill,
  GearDot,
  Person,
} from "@gravity-ui/icons";
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Description,
  Dropdown,
  Label,
  Separator,
  Spinner,
  Typography,
  useOverlayState,
  toast,
} from "@heroui/react";
import { useState } from "react";

import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { useUserAvatarUrl } from "@/hooks/use-user-avatar";
import { getUserDisplayName } from "@/lib/user-profile";

interface UserMenuProps {
  user: User;
}

const UserMenu: FC<UserMenuProps> = ({ user }) => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const alertState = useOverlayState();
  const [logoutLoading, setLogoutLoading] = useState(false);
  // 展示名：GitHub 用户名优先，不展示真名
  const name = getUserDisplayName(user);
  // 头像：候选链解析出的地址，header 与 dropdown 共用，保证两处永远一致
  const avatarUrl = useUserAvatarUrl(user);

  // 点击菜单回调
  const onClickMenu = (key: Key) => {
    switch (key) {
      case "admin":
        router.push("/admin");
        break;
      case "logout":
        alertState.open();
        break;
    }
  };

  // 退出登录
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      // 登出
      await supabase.auth.signOut();
      alertState.close();
      // 返回首页
      router.push("/login");
    } catch (err) {
      // 登出失败时保持弹窗打开并提示，避免用户以为已退出
      toast.danger("退出登录失败", {
        description: (err as Error).message,
        timeout: 2000,
        indicator: <CircleXmarkFill />,
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <Badge.Anchor>
            <Avatar size="sm">
              <Avatar.Image alt={name} src={avatarUrl} />
              <Avatar.Fallback>
                <Person />
              </Avatar.Fallback>
            </Avatar>
            <Badge
              className="min-h-2.5 min-w-2.5"
              color="success"
              placement="bottom-right"
              size="sm"
            />
          </Badge.Anchor>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <div className="flex items-center gap-3 p-3">
            <Avatar size="sm">
              <Avatar.Image alt={name} src={avatarUrl} />
              <Avatar.Fallback>
                <Person />
              </Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col space-y-1 min-w-0">
              <Typography
                className="text-sm font-black leading-normal"
                type="body"
              >
                {name}
              </Typography>
              <Description className="truncate">{user?.email}</Description>
            </div>
          </div>
          <Separator />
          <Dropdown.Menu className="font-normal" onAction={onClickMenu}>
            <Dropdown.Item id="admin" textValue="Admin">
              <GearDot className="size-4 shrink-0 text-muted" />
              <Label>管理后台</Label>
            </Dropdown.Item>
            <Dropdown.Item id="logout" textValue="Logout" variant="danger">
              <ArrowRightFromSquare className="size-4 shrink-0 text-danger" />
              <Label>退出登录</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      {/* 确认弹窗 */}
      <AlertDialog.Backdrop
        isOpen={alertState.isOpen}
        onOpenChange={alertState.setOpen}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>温馨提示</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>确定要退出登录吗？</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                取消
              </Button>
              <Button
                isPending={logoutLoading}
                variant="danger"
                onPress={() => handleLogout()}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "正在退出..." : "确认注销"}
                  </>
                )}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
};

export default UserMenu;
