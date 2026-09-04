/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-30 09:49:28
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-01-30 09:56:56
 * @Description: 提示框占位
 */

import type { AlertProps, ButtonVariants } from "@heroui/react";
import type { FC, ReactNode } from "react";

import { Alert, Button } from "@heroui/react";

interface AlertContentProps {
  status: AlertProps["status"];
  title: ReactNode;
  description: ReactNode;
  actionText: ReactNode;
  buttonVariant?: ButtonVariants["variant"];
  buttonAction?: () => void;
  className?: string;
}

const AlertContent: FC<AlertContentProps> = ({
  status,
  title,
  description,
  actionText,
  buttonVariant = "primary",
  buttonAction,
  className = "max-w-lg shadow-lg",
}) => {
  return (
    <Alert className={className} status={status}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description className="text-xs">{description}</Alert.Description>
        <Button
          className="mt-2 sm:hidden"
          size="sm"
          variant={buttonVariant}
          onPress={buttonAction}
        >
          {actionText}
        </Button>
      </Alert.Content>
      <Button
        className="hidden sm:block"
        size="sm"
        variant={buttonVariant}
        onPress={buttonAction}
      >
        {actionText}
      </Button>
    </Alert>
  );
};

export default AlertContent;
