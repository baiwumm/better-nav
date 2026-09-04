"use client";

import type { MotionProps, UseInViewOptions, Variants } from "motion/react";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface BlurFadeProps extends MotionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: MarginType;
  blur?: string;
}

type MarginType = UseInViewOptions["margin"];

export default function BlurFade({
  children,
  className,
  variant,
  duration = 0.65,
  delay = 0,
  offset = 20,
  direction = "up",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: {
      [direction === "left" || direction === "right" ? "x" : "y"]:
        direction === "right" || direction === "down" ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [direction === "left" || direction === "right" ? "x" : "y"]: 0,
      opacity: 1,
      filter: "none",
    },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <motion.div
      ref={ref}
      animate={isInView ? "visible" : "hidden"}
      className={className}
      initial="hidden"
      transition={{
        delay: 0.04 + delay,
        duration,
        ease: "easeOut",
      }}
      variants={combinedVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}
