'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const BRANCHES = [
  {
    key: 'strong',
    label: 'Strong dollar',
    active: false,
    effects: ['Dollar debt gets costlier for EM govts', 'Capital rotates back into US assets', 'Commodity prices (priced in USD) soften'],
    outcome: 'EM headwind',
  },
  {
    key: 'weak',
    label: 'Weak dollar (2026)',
    active: true,
    effects: ['EM debt burdens lighten', 'Capital flows into higher-yielding EM assets', 'Commodity prices stabilize or rise'],
    outcome: 'EM tailwind',
  },
]

export default function DollarCycleFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        The mechanism, mapped
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        Why the dollar decides the EM cycle
      </p>

      <div className="flex flex-col items-center">
        <m.div
          initial={reduce ? undefined : { opacity: 0, y: -8 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-center"
        >
          <p className="font-serif text-base font-semibold text-gray-900 dark:text-white">US Dollar Index</p>
        </m.div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {BRANCHES.map((b, i) => (
            <m.div
              key={b.key}
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.15 }}
              className={`rounded-xl border px-4 py-4 ${
                b.active
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 shadow-[0_8px_20px_-10px_rgba(5,150,105,0.4)]'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 opacity-70'
              }`}
            >
              <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${b.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {b.label}
              </p>
              <ul className="space-y-1.5 mb-3">
                {b.effects.map(e => (
                  <li key={e} className={`text-xs leading-snug flex items-start gap-1.5 ${b.active ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
              <div className={`text-center rounded-lg py-1.5 text-xs font-bold ${b.active ? 'bg-emerald-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {b.outcome}
              </div>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-5 leading-relaxed">
        The weak-dollar branch (highlighted) is the environment described as prevailing in 2026 in this analysis. Currency cycles reverse — this is a mechanism diagram, not a forecast.
      </p>
    </ChartCard>
  )
}
