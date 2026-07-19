'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const CATALYSTS = [
  { label: 'Hawkish Fed', detail: 'Rates held at 3.50-3.75%' },
  { label: 'Sticky inflation', detail: 'Third straight upward revision' },
  { label: 'Moonshot AI shock', detail: "New Chinese model rattles chip names" },
]

function Connector({ reduce }: { reduce: boolean | null }) {
  return (
    <m.div
      initial={reduce ? undefined : { scaleY: 0, opacity: 0 }}
      whileInView={reduce ? undefined : { scaleY: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="w-px h-6 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 mx-auto origin-top"
    />
  )
}

export default function AiCapexParadoxFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        The paradox, mapped
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        How record capex still produced a red week
      </p>

      <div className="flex flex-col items-center max-w-md mx-auto">
        <m.div
          initial={reduce ? undefined : { opacity: 0, y: -10 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-3 text-center shadow-[0_6px_16px_-8px_rgba(5,150,105,0.35)]"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Input</p>
          <p className="font-serif text-base font-semibold text-emerald-900 dark:text-emerald-100">
            AI capex hits record highs
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">TSMC guides 2026 capex to $60-64B</p>
        </m.div>

        <Connector reduce={reduce} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
          {CATALYSTS.map((c, i) => (
            <m.div
              key={c.label}
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.12 }}
              className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-center"
            >
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">{c.label}</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-snug">{c.detail}</p>
            </m.div>
          ))}
        </div>

        <Connector reduce={reduce} />

        <m.div
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="w-full rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 px-5 py-3 text-center shadow-[0_6px_16px_-8px_rgba(239,68,68,0.35)]"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-red-600 dark:text-red-400">Output</p>
          <p className="font-serif text-base font-semibold text-red-900 dark:text-red-100">
            Nasdaq -2.9% for the week
          </p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">SMH (semiconductors) fell ~9% over the same week</p>
        </m.div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-5 leading-relaxed">
        When good news stops moving prices, it usually means expectations — and valuations — got ahead of the fundamentals. Figures are approximate, week of July 13-17, 2026.
      </p>
    </ChartCard>
  )
}
