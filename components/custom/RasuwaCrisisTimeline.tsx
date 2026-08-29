'use client'

// Sequence of the disaster and the response. Deliberately day-relative rather
// than timestamped: the precise hour of each government decision was not
// consistently published in the first 72 hours, and inventing timestamps
// would be worse than admitting the granularity we actually have.

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

const EVENTS = [
  {
    when: 'Aug 26, morning',
    tag: 'Trigger',
    tone: 'border-amber-500',
    text: 'A magnitude 5.2 seismic event near the Nepal–China border dislodges roughly 0.2 km² of glacier ice at about 5,200 metres.',
  },
  {
    when: 'Aug 26, within hours',
    tag: 'Impact',
    tone: 'border-rose-500',
    text: 'The debris dam breaches. River levels surge by as much as 9 metres in 30 minutes. Syabrubesi and Timure are overwhelmed with effectively no warning.',
  },
  {
    when: 'Aug 26, same day',
    tag: 'Response',
    tone: 'border-sky-500',
    text: 'Army, Armed Police Force and Nepal Police mobilise. Helicopters begin lifting survivors out of settlements the roads can no longer reach.',
  },
  {
    when: 'Aug 26–27',
    tag: 'Cascade',
    tone: 'border-violet-500',
    text: 'Six transmission lines go down and the 220 kV Trishuli substation is destroyed. Telecom towers in Rasuwa and Nuwakot are swept away, degrading the rescue’s own communications.',
  },
  {
    when: 'Aug 27',
    tag: 'Medical',
    tone: 'border-emerald-500',
    text: 'A joint 42-doctor task force reaches Nuwakot District Hospital. With the road to Trishuli Hospital cut, the Army stands up a field treatment centre at Maithali Barracks.',
  },
  {
    when: 'Aug 27–28',
    tag: 'Declaration',
    tone: 'border-amber-500',
    text: 'The Cabinet declares Rasuwa, Nuwakot and Dhading local governments crisis zones for three months, and releases Rs 25 million across the three district disaster funds.',
  },
  {
    when: 'Aug 28–29',
    tag: 'Aid',
    tone: 'border-indigo-500',
    text: 'A toll-free missing-persons hotline (1234) goes live. India delivers 10 tonnes of humanitarian aid; other donor agencies pledge support. Confirmed deaths pass 350; more than 400 remain missing.',
  },
]

export default function RasuwaCrisisTimeline() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Timeline · 72 hours
      </p>
      <p className="font-serif text-xl mb-6 text-gray-900 dark:text-white">
        From the tremor to the crisis-zone declaration
      </p>

      <ol className="space-y-3">
        {EVENTS.map((e, i) => (
          <m.li
            key={e.when + e.tag}
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className={`border-l-4 ${e.tone} bg-white dark:bg-gray-900/60 rounded-r-xl px-4 py-3`}
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
              <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
                {e.when}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
                {e.tag}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{e.text}</p>
          </m.li>
        ))}
      </ol>
    </ChartCard>
  )
}
