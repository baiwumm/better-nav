/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2026-01-05 09:13:12
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2026-08-04 10:02:02
 * @Description: 日期时间
 */
import type { FC } from "react";

import { Description } from "@heroui/react";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Lunar } from "lunar-typescript";
import { memo, useEffect, useState } from "react";

import { formatDate } from "@/lib/utils";

const TimeAndLunar: FC = memo(() => {
  const [now, setNow] = useState(() => new Date());
  const [lunar, setLunar] = useState("");

  useEffect(() => {
    let lastDate = "";
    let lastSecond = -1;
    let timer: number;

    const tick = () => {
      const current = new Date();

      if (current.getSeconds() !== lastSecond) {
        lastSecond = current.getSeconds();
        setNow(current);

        const dateStr = formatDate(current);

        if (dateStr !== lastDate) {
          lastDate = dateStr;

          const l = Lunar.fromDate(current);

          setLunar(
            `${l.getYearInGanZhi()}年 ${l.getMonthInGanZhi()}月 ${l.getDayInGanZhi()}日 ${l.getMonthInChinese()}月${l.getDayInChinese()} 星期${l.getWeekInChinese()}`,
          );
        }
      }

      // 对齐到下一个整秒再调度：每次只唤醒一次，避免 rAF 的 60fps 常驻循环
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));

    return () => window.clearTimeout(timer);
  }, []);

  const d = now;

  return (
    <div className="justify-self-center hidden sm:flex flex-col gap-1 text-center">
      {/* 数字流时间 */}
      <NumberFlowGroup>
        <div className="flex items-center justify-center text-sm">
          <NumberFlow format={{ useGrouping: false }} value={d.getFullYear()} />
          <NumberFlow
            format={{ minimumIntegerDigits: 2 }}
            prefix="-"
            value={d.getMonth() + 1}
          />
          <NumberFlow
            format={{ minimumIntegerDigits: 2 }}
            prefix="-"
            value={d.getDate()}
          />
          <span className="mx-1"> </span>
          <NumberFlow
            format={{ minimumIntegerDigits: 2 }}
            value={d.getHours()}
          />
          <NumberFlow
            format={{ minimumIntegerDigits: 2 }}
            prefix=":"
            value={d.getMinutes()}
          />
          <NumberFlow
            format={{ minimumIntegerDigits: 2 }}
            prefix=":"
            value={d.getSeconds()}
          />
        </div>
      </NumberFlowGroup>
      {/* 农历 */}
      <Description>{lunar || "加载农历中..."}</Description>
    </div>
  );
});

TimeAndLunar.displayName = "TimeAndLunar";
export default TimeAndLunar;
