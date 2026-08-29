'use client'

// Three views of the official response, from figures released by Nepali
// authorities in the first 72 hours. Everything here is provisional and was
// still moving when this was published — the post says so explicitly.

import { useState } from 'react'
import { m, useReducedMotion } from 'motion/react'

type TabKey = 'rescue' | 'medical' | 'money'

interface Tile {
  value: string
  label: string
  detail: string
}

const TABS: { key: TabKey; label: string; accent: string; tiles: Tile[]; footnote: string }[] = [
  {
    key: 'rescue',
    label: 'Search & rescue',
    accent: 'bg-sky-600',
    tiles: [
      { value: '14', label: 'Helicopters mobilised', detail: 'Government and private aircraft flying together' },
      { value: '250+', label: 'Survivors airlifted', detail: 'Lifted out of cut-off settlements' },
      { value: '3', label: 'Security forces deployed', detail: 'Nepali Army, Armed Police Force, Nepal Police' },
      { value: 'Drones + dogs', label: 'Search assets', detail: 'Used to locate people trapped in debris' },
    ],
    footnote:
      'With the highways severed, aviation was not a supplement to the road response — for several days it was the response.',
  },
  {
    key: 'medical',
    label: 'Medical',
    accent: 'bg-rose-600',
    tiles: [
      { value: '42', label: 'Doctors in the joint task force', detail: '15 Army, 12 Police, 15 Armed Police Force' },
      { value: '20', label: 'Specialists at the field centre', detail: 'Including two surgeons, at Maithali Barracks' },
      { value: '100', label: 'Beds reserved in Kathmandu', detail: 'Trauma Centre, Bir Hospital, TU Teaching Hospital' },
      { value: 'Free', label: 'Treatment for flood victims', detail: 'Mandated by the government for those injured' },
    ],
    footnote:
      'The field centre at Maithali Barracks exists because the road to Trishuli Hospital was gone. The care had to move to the patients.',
  },
  {
    key: 'money',
    label: 'Money & declarations',
    accent: 'bg-amber-600',
    tiles: [
      { value: 'Rs 10m', label: 'Released to Rasuwa', detail: 'Straight into the district disaster fund' },
      { value: 'Rs 10m', label: 'Released to Nuwakot', detail: 'Same mechanism, same day' },
      { value: 'Rs 5m', label: 'Released to Dhading', detail: 'Downstream district, bodies recovered there' },
      { value: '3 months', label: 'Crisis-zone declaration', detail: 'Rasuwa, Nuwakot and Dhading local governments' },
    ],
    footnote:
      'Rs 25 million total is deliberately small and deliberately fast — it is bureaucracy-bypass money for the first week, not reconstruction funding.',
  },
]

export default function RasuwaResponseDashboard() {
  const [active, setActive] = useState<TabKey>('rescue')
  const reduce = useReducedMotion()
  const tab = TABS.find((t) => t.key === active)!

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Dashboard · the official response
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What was actually deployed, by category
      </p>

      <div
        className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 mb-6"
        role="tablist"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active === t.key
                ? `${t.accent} text-white`
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {tab.tiles.map((tile, i) => (
          <m.div
            key={`${tab.key}-${tile.label}`}
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3"
          >
            <p className="font-serif text-2xl font-bold text-gray-900 dark:text-white">{tile.value}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-0.5">{tile.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{tile.detail}</p>
          </m.div>
        ))}
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-5 leading-relaxed">{tab.footnote}</p>
    </div>
  )
}
