'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

export default function AcaCliffFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        The cliff mechanic
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        One income line decides everything
      </p>

      <div className="flex flex-col items-center">
        <m.div
          initial={reduce ? undefined : { opacity: 0, y: -8 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-center mb-3"
        >
          <p className="font-serif text-base font-semibold text-gray-900 dark:text-white">
            Your household MAGI
          </p>
        </m.div>

        <m.div
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400 text-xs font-mono mb-3"
        >
          ↓ compared against 400% of the federal poverty level ↓
        </m.div>

        <div className="grid sm:grid-cols-2 gap-3 w-full">
          <m.div
            initial={reduce ? undefined : { opacity: 0, x: -12 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 px-4 py-3.5"
          >
            <p className="text-xs font-bold uppercase tracking-wide mb-1.5">Under 400% FPL</p>
            <p className="text-[11px] leading-snug opacity-90">Sliding-scale premium tax credit — the closer to the line, the smaller the credit.</p>
          </m.div>
          <m.div
            initial={reduce ? undefined : { opacity: 0, x: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100 px-4 py-3.5"
          >
            <p className="text-xs font-bold uppercase tracking-wide mb-1.5">At or over 400% FPL</p>
            <p className="text-[11px] leading-snug opacity-90">Zero premium tax credit — you pay the full, unsubsidized sticker price.</p>
          </m.div>
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-5 leading-relaxed">
        There&apos;s no phase-out ramp at the top like there is with many tax credits — one dollar over the line and the entire subsidy disappears at once.
      </p>
    </ChartCard>
  )
}
