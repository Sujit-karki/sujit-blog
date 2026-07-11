'use client'

import { m, useReducedMotion } from 'motion/react'
import { variants, hover } from '@/lib/motion/tokens'

interface ChartCardProps {
  children: React.ReactNode
  className?: string
}

export default function ChartCard({ children, className = '' }: ChartCardProps) {
  const reduce = useReducedMotion()

  return (
    <m.div
      initial={reduce ? undefined : variants.card.hidden}
      whileInView={reduce ? undefined : variants.card.show}
      viewport={{ once: true, margin: '-60px' }}
      whileHover={reduce ? undefined : hover.cardLift}
      transition={variants.card.show.transition}
      className={`not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl ${className}`}
    >
      {children}
    </m.div>
  )
}
