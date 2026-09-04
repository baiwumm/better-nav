/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-22 14:12:20
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 09:46:25
 * @Description: 登录页
 */
"use client";
import type { FormEvent } from "react";

import { useRouter } from "@bprogress/next/app";
import {
  Check,
  CircleInfo,
  CircleXmark,
  Envelope,
  Eye,
  EyeSlash,
  Lock,
} from "@gravity-ui/icons";
import {
  Button,
  Card,
  Description,
  FieldError,
  Form,
  InputGroup,
  Label,
  Separator,
  Spinner,
  TextField,
  toast,
  Typography,
} from "@heroui/react";
import Image from "next/image";
import { useState } from "react";

import { GithubIcon, GoogleIcon } from "@/lib/icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const Providers = [
  { value: "google" as const, label: "使用 Google 登录", icon: <GoogleIcon /> },
  { value: "github" as const, label: "使用 Github 登录", icon: <GithubIcon /> },
];

interface EmailForm {
  email: string;
  password: string;
}

export default function Login() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  // 是否显示密码
  const [showPassword, setShowPassword] = useState(false);

  // 表单提交
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Partial<EmailForm> = {};

    formData.forEach((value, key) => {
      data[key as keyof EmailForm] = value.toString();
    });

    setEmailLoading(true);

    // ✅ 直接走邮箱密码登录（注册入口已移除，仅白名单管理员可进后台）
    const authPromise = supabase.auth
      .signInWithPassword(data as EmailForm)
      .then((result) => {
        if (result.error) {
          throw result.error; // 统一抛出错误
        }

        return result.data;
      });

    toast.promise(authPromise, {
      loading: "登录中...",
      success: () => {
        setEmailLoading(false);
        router.refresh();

        return "登录成功，欢迎回来！";
      },
      error: (err: { message: string }) => {
        setEmailLoading(false);

        return `登录失败，请稍后重试：${err.message}`;
      },
    });

    setTimeout(() => {
      toast.clear();
    }, 2000);
  };

  // 谷歌或者 Github 登录
  const handleOAuthLogin = async (provider: "google" | "github") => {
    setOauthLoading(true);
    // 加一个短提示，避免跳转等待时间过长无反馈
    toast("登录中...", {
      timeout: 2000,
      indicator: <CircleInfo />,
    });

    // 错误提示
    const errorToast = (msg: string) => {
      toast.danger("登录失败，请稍后重试", {
        description: msg,
        timeout: 2000,
        indicator: <CircleXmark />,
      });
    };

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: process.env.NEXT_PUBLIC_APP_URL,
        },
      });

      if (error) {
        errorToast(error.message);
        setOauthLoading(false);
      }
    } catch (err) {
      errorToast((err as Error).message);
      setOauthLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-1">
      <Card className="w-lg max-w-md shadow-md">
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="size-10 relative">
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
            <div className="flex flex-col">
              <Typography
                className="text-lg leading-normal"
                type="body"
                weight="bold"
              >
                {process.env.NEXT_PUBLIC_APP_NAME}
              </Typography>
              <Description>{process.env.NEXT_PUBLIC_APP_TITLE}</Description>
            </div>
          </div>
        </Card.Header>
        <Separator />
        <Card.Content>
          <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <TextField
              isRequired
              name="email"
              type="email"
              validate={(value) => {
                if (!/^[\w.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                  return "请输入合法的邮箱地址!";
                }

                return null;
              }}
            >
              <Label>邮箱地址</Label>
              <InputGroup variant="secondary">
                <InputGroup.Prefix>
                  <Envelope className="size-4 text-muted" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  aria-label="Email"
                  placeholder="请输入邮箱地址"
                />
              </InputGroup>
              <FieldError />
            </TextField>
            <TextField
              isRequired
              maxLength={12}
              minLength={6}
              name="password"
              type="password"
              validate={(value) => {
                if (value.length < 6 || value.length > 12) {
                  return "请输入长度为6-12的字符串.";
                }
                if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value)) {
                  return "密码必须包含大小写字母和数字";
                }

                return null;
              }}
            >
              <Label>密码</Label>
              <InputGroup variant="secondary">
                <InputGroup.Prefix>
                  <Lock className="size-4 text-muted" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  aria-label="Password"
                  placeholder="请输入密码"
                  type={showPassword ? "text" : "password"}
                />
                <InputGroup.Suffix className="pr-0">
                  <Button
                    isIconOnly
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    size="sm"
                    variant="ghost"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeSlash className="size-4" />
                    )}
                  </Button>
                </InputGroup.Suffix>
              </InputGroup>
              <Description>密码必须包含大小写字母和数字.</Description>
              <FieldError />
            </TextField>
            <Button
              className="w-full"
              isDisabled={oauthLoading || emailLoading}
              isPending={emailLoading}
              type="submit"
            >
              {({ isPending }) => (
                <>
                  {isPending ? (
                    <Spinner color="current" size="sm" />
                  ) : (
                    <Check />
                  )}
                  {isPending ? "登录中..." : "登录"}
                </>
              )}
            </Button>
          </Form>
        </Card.Content>
        <Separator />
        <Card.Footer className="flex-col gap-2">
          <div className="flex w-full flex-col gap-3">
            {Providers.map(({ value, label, icon }) => (
              <Button
                key={value}
                className="w-full"
                isDisabled={oauthLoading || emailLoading}
                isPending={oauthLoading}
                variant="outline"
                onPress={() => handleOAuthLogin(value)}
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner size="sm" /> : icon}
                    {label}
                  </>
                )}
              </Button>
            ))}
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}
