'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const OUTCOMES = [
  { label: 'Under 5 years', verdict: 'Lean rent', detail: 'Closing costs and selling costs rarely amortize in time', color: 'red' },
  { label: '5–8 years', verdict: 'Run your numbers', detail: 'This is where local price, rate, and rent gap actually decide it', color: 'amber' },
  { label: '8+ years', verdict: 'Lean buy', detail: 'Amortization and appreciation have time to work in your favor', color: 'emerald' },
]

const COLOR_MAP: Record<string, string> = {
  red: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100',
  amber: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100',
  emerald: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100',
}

export default function BuyOrRentDecisionFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        The one input that matters most
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        Your time horizon decides more than the rate does
      </p>

      <div className="flex flex-col items-center">
        <m.div
          initial={reduce ? undefined : { opacity: 0, y: -8 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-center mb-6"
        >
          <p className="font-serif text-base font-semibold text-gray-900 dark:text-white">
            How long do you plan to stay?
          </p>
        </m.div>

        <div className="grid sm:grid-cols-3 gap-3 w-full">
          {OUTCOMES.map((o, i) => (
            <m.div
              key={o.label}
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className={`rounded-lg border px-3.5 py-3.5 ${COLOR_MAP[o.color]}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide mb-1">{o.label}</p>
              <p className="text-sm font-bold mb-1">{o.verdict}</p>
              <p className="text-[11px] leading-snug opacity-90">{o.detail}</p>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-5 leading-relaxed">
        These are general lean-directions, not thresholds — your actual break-even year depends on price, rate, and local rent, which is exactly what the calculator below computes.
      </p>
    </ChartCard>
  )
}
