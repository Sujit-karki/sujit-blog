'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const STEPS = [
  { n: 1, label: 'CPI-W collected for Jul, Aug, Sep', detail: 'The Bureau of Labor Statistics measures inflation for wage earners over the third quarter' },
  { n: 2, label: 'Averaged and compared to the prior year', detail: 'This year’s Q3 average vs. last year’s Q3 average' },
  { n: 3, label: 'The % increase becomes the COLA', detail: 'Rounded to the nearest 0.1% — this is the only input, by law' },
  { n: 4, label: 'SSA announces the official number', detail: 'Always in October, for the following January' },
  { n: 5, label: 'Applied to benefits starting January', detail: 'Automatic — no application needed' },
]

export default function ColaCalculationFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        How the number actually gets set
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        From CPI-W to your check, in 5 steps
      </p>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-400 via-emerald-400 to-emerald-200 dark:to-emerald-800" />
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <m.div
              key={s.n}
              initial={reduce ? undefined : { opacity: 0, x: -12 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="relative flex items-center gap-4"
            >
              <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_4px_10px_-4px_rgba(5,150,105,0.6)]">
                {s.n}
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3.5 py-2.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.detail}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-5 leading-relaxed">
        Every estimate you see before October — 3.6%, 3.7%, 3.8% — is a forecast of step 3, made before steps 1–2 are even complete for Aug/Sep.
      </p>
    </ChartCard>
  )
}
