'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const STEPS = [
  { n: 1, label: 'GDP print lands', detail: 'Measures growth — is the economy expanding or slowing?' },
  { n: 2, label: 'PCE print lands, same morning', detail: "Measures inflation — the Fed's preferred gauge, not CPI" },
  { n: 3, label: 'The Fed reads both together', detail: "Growth alone would argue for cuts; core PCE at 3.4% argues against them" },
  { n: 4, label: 'Result: hold, higher-for-longer', detail: 'The Fed has stressed "no tolerance" for inflation above target' },
  { n: 5, label: 'What it means for you', detail: 'Borrowing costs stay elevated; a raise below ~4% is a real pay cut' },
]

export default function GDPReactionFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        From release to your wallet
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        How one morning&apos;s data turns into your interest rate
      </p>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-sky-400 via-sky-400 to-sky-200 dark:to-sky-800" />
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
              <div
                className={`relative z-10 w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_4px_10px_-4px_rgba(2,132,199,0.6)] ${
                  i === STEPS.length - 1 ? 'bg-emerald-600' : 'bg-sky-600'
                }`}
              >
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
        Illustrative chain of reasoning, not a forecast of what the Fed will actually do on any given date.
      </p>
    </ChartCard>
  )
}
