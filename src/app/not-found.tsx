/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2025-11-20 14:00:11
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-02-03 14:41:02
 * @Description: 404 页面
 */
import type { FC } from "react";

import { Button, Typography } from "@heroui/react";
import Link from "next/link";

const NotFound: FC = () => {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="text-center">
        <Typography
          align="center"
          className="mt-4 text-balance text-5xl sm:text-7xl"
          type="h1"
        >
          404
        </Typography>
        <Typography
          align="center"
          className="mt-6 text-pretty text-lg sm:text-xl/8"
          color="muted"
          type="body"
          weight="medium"
        >
          看来这个页面去环球旅行了，还没寄明信片回来。
        </Typography>
        <div className="flex items-center justify-center mt-10">
          <Link href="/">
            <Button>回到首页</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
