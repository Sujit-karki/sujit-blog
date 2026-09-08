'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const CHANNELS = [
  { label: 'Bonds', effect: 'Prices fall, yields rise', color: 'indigo' },
  { label: 'Equities', effect: 'P/E multiples compress, growth hit hardest', color: 'red' },
  { label: 'Real estate', effect: 'Mortgage rates track Treasury yields up', color: 'amber' },
  { label: 'Currency', effect: 'Dollar strengthens, pressures EM assets', color: 'emerald' },
]

const COLOR_MAP: Record<string, string> = {
  indigo: 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100',
  red: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100',
  amber: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100',
  emerald: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100',
}

export default function FedTransmissionFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        The transmission mechanism
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        One rate decision, four market channels
      </p>

      <div className="flex flex-col items-center">
        <m.div
          initial={reduce ? undefined : { opacity: 0, y: -8 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-center mb-6"
        >
          <p className="font-serif text-base font-semibold text-gray-900 dark:text-white">
            Fed changes the federal funds rate
          </p>
        </m.div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {CHANNELS.map((c, i) => (
            <m.div
              key={c.label}
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className={`rounded-lg border px-3 py-3 ${COLOR_MAP[c.color]}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide mb-1">{c.label}</p>
              <p className="text-[11px] leading-snug opacity-90">{c.effect}</p>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-5 leading-relaxed">
        Directionally accurate for a rate-hike cycle; effects run in reverse when the Fed cuts. Magnitude and timing vary by cycle.
      </p>
    </ChartCard>
  )
}
