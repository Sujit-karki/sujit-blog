'use client'

import { useEffect, useRef } from 'react'
import { m, useMotionValue, useSpring, useTransform, useInView, useReducedMotion } from 'motion/react'

interface AnimatedNumberProps {
  value: number
  format?: (v: number) => string
  className?: string
  startFromZero?: boolean
}

export default function AnimatedNumber({
  value,
  format = v => Math.round(v).toLocaleString('en-US'),
  className,
  startFromZero = false,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionVal = useMotionValue(startFromZero ? 0 : value)
  const spring = useSpring(motionVal, { stiffness: 100, damping: 24, mass: 0.7 })
  const display = useTransform(spring, v => format(v))

  useEffect(() => {
    if (!startFromZero || inView) motionVal.set(value)
  }, [value, inView, startFromZero, motionVal])

  if (reduce) {
    return (
      <span ref={ref} className={className}>
        {format(value)}
      </span>
    )
  }

  return (
    <m.span ref={ref} className={className}>
      {display}
    </m.span>
  )
}
