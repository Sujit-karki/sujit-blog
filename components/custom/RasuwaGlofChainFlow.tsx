'use client'

// The five-stage cascade that turned a moderate earthquake into a
// catastrophic debris flow. Stage figures (5.2 M, ~5,200 m detachment
// elevation, ~0.2 km2 of ice, 9 m surge in 30 minutes) are the provisional
// figures reported by Nepali authorities and satellite analysts in the
// first 72 hours — see the post body for the sourcing caveat.

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const STAGES = [
  {
    n: 1,
    label: 'Magnitude 5.2 seismic event',
    detail: 'Near the Nepal–China (Tibet) border, morning of August 26, 2026. Moderate on its own — destructive because of what it was sitting under.',
    tone: 'from-amber-500 to-amber-600',
    time: 'T + 0',
  },
  {
    n: 2,
    label: 'Glacier detaches at ~5,200 m',
    detail: 'Satellite imagery indicates roughly 0.2 km² of ice broke away and fell into the valley — an ice-and-rock avalanche, not rainfall.',
    tone: 'from-sky-500 to-sky-600',
    time: 'minutes',
  },
  {
    n: 3,
    label: 'Debris blocks the river',
    detail: 'The avalanche deposit dammed the channel. A landslide dam is unengineered, unmonitored, and holds only until it does not.',
    tone: 'from-indigo-500 to-indigo-600',
    time: 'minutes to hours',
  },
  {
    n: 4,
    label: 'The dam breaches',
    detail: 'Impounded water cut through the debris at once rather than draining gradually — the classic outburst mechanism (GLOF).',
    tone: 'from-violet-500 to-violet-600',
    time: 'sudden',
  },
  {
    n: 5,
    label: 'Debris flow hits settlements',
    detail: 'River levels rose by as much as 9 metres in 30 minutes downstream. Not clean water — a slurry of mud, boulders, and ice.',
    tone: 'from-rose-500 to-rose-600',
    time: '≈ 30 min',
  },
]

export default function RasuwaGlofChainFlow() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Flowchart · the cascade
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        How one moderate earthquake produced a 9-metre wall of debris
      </p>

      <div className="relative">
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-amber-400 via-indigo-400 to-rose-400" />
        <div className="space-y-4">
          {STAGES.map((s, i) => (
            <m.div
              key={s.n}
              initial={reduce ? undefined : { opacity: 0, x: -14 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.12 }}
              className="relative flex items-start gap-4"
            >
              <div
                className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-br ${s.tone} text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]`}
              >
                {s.n}
              </div>
              <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.label}</p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 shrink-0">
                    {s.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{s.detail}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-5 leading-relaxed">
        Every stage after the first is a physical process, not a weather forecast. That is why no rain warning
        existed to issue — and why stage 5 arrived before anyone downstream knew stage 2 had happened.
      </p>
    </ChartCard>
  )
}
