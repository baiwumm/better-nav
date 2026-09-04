/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-03-09 16:35:42
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-03-09 16:37:45
 * @Description: 表格 Loading
 */
import type { FC } from "react";

import { Spinner } from "@heroui/react";

interface TableLoadingProps {
  loading: boolean;
}

const TableLoading: FC<TableLoadingProps> = ({ loading }) => {
  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] pointer-events-auto">
        <Spinner />
      </div>
    );
  }

  return null;
};

export default TableLoading;
