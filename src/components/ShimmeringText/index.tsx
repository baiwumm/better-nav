"use client";

import type { UseInViewOptions } from "motion/react";

import { cn } from "@heroui/react";
import { motion, useInView } from "motion/react";
import React, { useMemo, useRef } from "react";

interface ShimmeringTextProps {
  /** Text to display with shimmer effect */
  text: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before starting animation */
  delay?: number;
  /** Whether to repeat the animation */
  repeat?: boolean;
  /** Pause duration between repeats in seconds */
  repeatDelay?: number;
  /** Custom className */
  className?: string;
  /** Whether to start animation when component enters viewport */
  startOnView?: boolean;
  /** Whether to animate only once */
  once?: boolean;
  /** Margin for in-view detection (rootMargin) */
  inViewMargin?: UseInViewOptions["margin"];
  /** Shimmer spread multiplier */
  spread?: number;
  /** Base text color */
  color?: string;
  /** Shimmer gradient color */
  shimmerColor?: string;
}

export function ShimmeringText({
  text,
  duration = 2,
  delay = 0,
  repeat = true,
  repeatDelay = 0.5,
  className,
  startOnView = true,
  once = false,
  inViewMargin,
  spread = 2,
  color,
  shimmerColor,
}: ShimmeringTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: inViewMargin });

  // Calculate dynamic spread based on text length
  const dynamicSpread = useMemo(() => {
    return text.length * spread;
  }, [text, spread]);

  // Determine if we should start animation
  const shouldAnimate = !startOnView || isInView;

  return (
    <motion.span
      ref={ref}
      animate={
        shouldAnimate
          ? {
              backgroundPosition: "0% center",
              opacity: 1,
            }
          : {}
      }
      className={cn(
        "relative inline-block bg-size-[250%_100%,auto] bg-clip-text text-transparent",
        "[--base-color:var(--color-zinc-400)] [--shimmer-color:var(--color-zinc-950)]",
        "[background-repeat:no-repeat,padding-box]",
        "[--shimmer-bg:linear-gradient(90deg,transparent_calc(50%-var(--spread)),var(--shimmer-color),transparent_calc(50%+var(--spread)))]",
        "dark:[--base-color:var(--color-zinc-600)] dark:[--shimmer-color:var(--color-white)]",
        className,
      )}
      initial={{
        backgroundPosition: "100% center",
        opacity: 0,
      }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          ...(color && { "--base-color": color }),
          ...(shimmerColor && { "--shimmer-color": shimmerColor }),
          backgroundImage: `var(--shimmer-bg), linear-gradient(var(--base-color), var(--base-color))`,
        } as React.CSSProperties
      }
      transition={{
        backgroundPosition: {
          repeat: repeat ? Infinity : 0,
          duration,
          delay,
          repeatDelay,
          ease: "linear",
        },
        opacity: {
          duration: 0.3,
          delay,
        },
      }}
    >
      {text}
    </motion.span>
  );
}
