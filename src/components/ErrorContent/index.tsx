/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-06 17:59:51
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-07-15 16:33:15
 * @Description: 错误页面
 */
import type { FC } from "react";

import { Alert, Button } from "@heroui/react";

interface ErrorContentProps {
  refresh: VoidFunction;
}

const ErrorContent: FC<ErrorContentProps> = ({ refresh }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Alert className="max-w-xl" status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>获取站点数据失败，请稍后重试</Alert.Title>
          <Alert.Description>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[13px]">
              <li>当前无法获取站点数据</li>
              <li>请检查 SUPABASE 配置是否正确</li>
              <li>可能由于网络异常或服务暂时不可用</li>
              <li>请稍后重试</li>
            </ul>
          </Alert.Description>
          <Button
            className="mt-2 sm:hidden"
            size="sm"
            variant="danger"
            onPress={refresh}
          >
            重试
          </Button>
        </Alert.Content>
        <Button
          className="hidden sm:block"
          size="sm"
          variant="danger"
          onPress={refresh}
        >
          重试
        </Button>
      </Alert>
    </div>
  );
};

export default ErrorContent;
