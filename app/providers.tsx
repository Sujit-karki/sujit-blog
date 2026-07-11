"use client";

import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import { duration, ease } from "@/lib/motion/tokens";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: duration.base, ease: ease.standard }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
