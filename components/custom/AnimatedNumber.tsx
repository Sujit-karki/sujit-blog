'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

interface AnimatedNumberProps {
  value: number
  format?: (v: number) => string
  className?: string
  startFromZero?: boolean
}

const DURATION_MS = 700

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// Plain requestAnimationFrame tween instead of a motion-library spring. A prior
// version drove the display via a framer-motion MotionValue passed as
// <m.span>'s children (bypassing normal React re-renders for perf) gated on
// useInView — in this app's Next 16 + React Compiler setup that combination
// reliably failed to update the rendered number both on first reveal and on
// later value changes (reproduced in a production build, not just dev). This
// implementation uses ordinary React state, so the displayed text is always a
// direct function of a real re-render — no third-party subscription to debug.
export default function AnimatedNumber({
  value,
  format = v => Math.round(v).toLocaleString('en-US'),
  className,
  startFromZero = false,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(startFromZero ? 0 : value)
  const fromRef = useRef(startFromZero ? 0 : value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduce) return
    const from = fromRef.current
    const to = value
    if (from === to) return

    const start = performance.now()
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS)
      const eased = easeOutCubic(t)
      const next = from + (to - from) * eased
      setDisplay(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, reduce])

  if (reduce) {
    return <span className={className}>{format(value)}</span>
  }

  return <span className={className}>{format(display)}</span>
}
