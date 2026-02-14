"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  animationNum?: number;
  customVariants?: {
    visible: (i: number) => {
      y: number;
      opacity: number;
      filter: string;
      transition: {
        delay: number;
        duration: number;
      };
    };
    hidden: {
      filter: string;
      y: number;
      opacity: number;
    };
  };
  timelineRef?: React.RefObject<HTMLDivElement>;
}

export function TimelineContent({
  children,
  as: Component = "div",
  className,
  animationNum = 0,
  customVariants,
  timelineRef,
}: TimelineContentProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(timelineRef || ref, { once: true, margin: "-100px" });

  const defaultVariants = {
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: animationNum * 0.1,
        duration: 0.5,
      },
    },
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const variants = customVariants || defaultVariants;

  const ComponentTag = Component as any;

  return (
    <motion.div
      ref={ref as any}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
    >
      {Component === "div" ? (
        <div>{children}</div>
      ) : Component === "h1" ? (
        <h1>{children}</h1>
      ) : Component === "p" ? (
        <p>{children}</p>
      ) : (
        <ComponentTag>{children}</ComponentTag>
      )}
    </motion.div>
  );
}

