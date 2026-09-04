/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-08-10 10:00:00
 * @Description: 后台路由加载 Loading
 */
import { Description, Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="flex flex-col items-center gap-2">
        <Spinner />
        <Description className="font-black">加载中...</Description>
      </div>
    </div>
  );
}
