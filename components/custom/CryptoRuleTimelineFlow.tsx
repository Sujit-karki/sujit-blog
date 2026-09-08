'use client'

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const STEPS = [
  { n: 1, label: 'May 2025 — DOL rescinds "extreme care" guidance', detail: 'Removes the Biden-era warning against crypto in 401(k)s' },
  { n: 2, label: 'Aug 7, 2025 — Executive order signed', detail: '"Democratizing Access to Alternative Assets" directs DOL to act' },
  { n: 3, label: 'Mar 30, 2026 — DOL proposes the rule', detail: 'A process-based safe harbor, not a crypto endorsement' },
  { n: 4, label: 'Jun 1, 2026 — Comment period closes', detail: 'Warren, Sanders, and Scott send a 14-page objection letter' },
  { n: 5, label: 'Today — Final rule: pending', detail: 'Not law yet. No plan is required to add crypto even if it passes' },
]

export default function CryptoRuleTimelineFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Regulatory timeline
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        How &ldquo;crypto is coming to your 401(k)&rdquo; actually got here
      </p>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-400 via-indigo-400 to-indigo-200 dark:to-indigo-800" />
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
                className={`relative z-10 w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_4px_10px_-4px_rgba(79,70,229,0.6)] ${
                  i === STEPS.length - 1 ? 'bg-amber-500' : 'bg-indigo-600'
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

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-5 leading-relaxed">
        Five steps, none of which is &ldquo;crypto is now in your 401(k).&rdquo; The rule is still a proposal as of July 2026.
      </p>
    </ChartCard>
  )
}
