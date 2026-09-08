'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

// Illustrative qualitative position within each metric's typical historical
// range (0 = extreme low, 100 = extreme high) — not a precise live reading.
const METRICS = [
  {
    label: 'Long-Term Holder Supply',
    position: 85,
    reading: 'Near multi-year highs',
    signal: 'Bullish',
    detail: 'Coins held 155+ days — high LTH supply signals conviction, not panic',
    color: 'emerald',
  },
  {
    label: 'Exchange Reserves',
    position: 12,
    reading: 'Near 5-year lows',
    signal: 'Bullish',
    detail: 'Falling reserves mean fewer coins sitting on exchanges ready to sell',
    color: 'emerald',
  },
  {
    label: 'MVRV Z-Score',
    position: 50,
    reading: 'Fair value zone',
    signal: 'Neutral',
    detail: 'Market cap vs. realized cap — neither overheated nor undervalued',
    color: 'amber',
  },
]

const COLOR = {
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' },
}

export default function OnChainMetricsDashboard() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        On-chain snapshot
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        What holder behavior is signaling
      </p>

      <div className="space-y-5">
        {METRICS.map((m2, i) => {
          const c = COLOR[m2.color as keyof typeof COLOR]
          return (
            <m.div
              key={m2.label}
              initial={reduce ? undefined : { opacity: 0, x: -10 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.12 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{m2.label}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${c.badge}`}>
                  {m2.signal}
                </span>
              </div>
              <div className="relative h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <m.div
                  initial={reduce ? undefined : { width: 0 }}
                  whileInView={reduce ? undefined : { width: `${m2.position}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.12 }}
                  className={`h-full rounded-full ${c.bar}`}
                  style={reduce ? { width: `${m2.position}%` } : undefined}
                />
              </div>
              <p className={`text-xs mt-1.5 ${c.text} font-medium`}>{m2.reading}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{m2.detail}</p>
            </m.div>
          )
        })}
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-5 leading-relaxed">
        Bar position is an illustrative qualitative read of where each metric sits within its typical historical range, not a precise live data feed. See Glassnode and Look Into Bitcoin in the sources below for real-time values.
      </p>
    </ChartCard>
  )
}
