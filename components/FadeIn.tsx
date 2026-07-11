"use client";

import { m, useReducedMotion } from "motion/react";
import { duration as dur, ease } from "@/lib/motion/tokens";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export default function FadeIn({ children, delay = 0, y = 20, className }: FadeInProps) {
  const reduce = useReducedMotion();

  return (
    <m.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduce ? 0 : dur.slow,
        delay: reduce ? 0 : delay,
        ease: ease.entrance,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
