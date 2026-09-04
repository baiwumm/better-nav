/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2025-12-11 14:06:31
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-01-27 14:47:09
 * @Description: 空数据
 */
import type { FC } from "react";

import { Tray } from "@gravity-ui/icons";
import { Description } from "@heroui/react";

const EmptyContent: FC = () => {
  return (
    <div className="flex flex-col gap-2 justify-center items-center text-muted py-20">
      <Tray className="size-10" />
      <Description>暂无数据</Description>
    </div>
  );
};

export default EmptyContent;
