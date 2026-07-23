'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const STEPS = [
  { n: 1, label: 'Confirm your job qualifies', detail: 'A customarily-tipped occupation, or FLSA-covered overtime hours' },
  { n: 2, label: 'Total your qualified tips or OT premium', detail: 'Overtime only counts the "half" of time-and-a-half, not the full hour' },
  { n: 3, label: 'Cap it', detail: '$25,000 tips · $12,500 overtime ($25,000 joint)' },
  { n: 4, label: 'Check MAGI against $150k / $300k', detail: 'The deduction shrinks above this threshold' },
  { n: 5, label: 'Claim it on Schedule 1-A', detail: 'Whether you itemize or take the standard deduction' },
]

export default function TipsOvertimeClaimFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Claiming it, step by step
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        From pay stub to Schedule 1-A
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
        Payroll tax (Social Security/Medicare) is withheld before any of this — the deduction only reduces federal income tax.
      </p>
    </ChartCard>
  )
}
