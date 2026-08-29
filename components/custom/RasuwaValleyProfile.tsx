'use client'

// Longitudinal profile of the flood path, from the detachment zone on the
// Nepal–Tibet border down to the Chitwan lowlands where bodies were later
// recovered. Elevations are approximate published settlement elevations,
// drawn to a compressed vertical scale so the whole 150 km path fits — this
// is a schematic, not a survey.

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

interface Node {
  x: number
  y: number
  name: string
  elev: string
  note: string
}

// x = horizontal position in the 820-wide viewBox, y = terrain height line
const NODES: Node[] = [
  { x: 70, y: 60, name: 'Detachment zone', elev: '≈ 5,200 m', note: '~0.2 km² of ice breaks away' },
  { x: 210, y: 138, name: 'Rasuwagadhi / Timure', elev: '≈ 1,850 m', note: 'Border point, customs office damaged' },
  { x: 350, y: 186, name: 'Syabrubesi', elev: '≈ 1,460 m', note: 'Langtang trek gateway, heavily hit' },
  { x: 520, y: 240, name: 'Trishuli / Nuwakot', elev: '≈ 600 m', note: '220 kV substation destroyed' },
  { x: 680, y: 272, name: 'Dhading', elev: '≈ 400 m', note: 'Bridges severed on Prithvi Highway' },
  { x: 780, y: 292, name: 'Chitwan', elev: '≈ 200 m', note: 'Bodies recovered far downstream' },
]

const TERRAIN = 'M 20 96 L 70 60 L 140 108 L 210 138 L 280 164 L 350 186 L 430 214 L 520 240 L 600 258 L 680 272 L 780 292 L 810 300'

export default function RasuwaValleyProfile() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Diagram · longitudinal profile
      </p>
      <p className="font-serif text-xl mb-1 text-gray-900 dark:text-white">
        From 5,200 metres to the Chitwan plains
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Schematic, not to scale. Vertical exaggeration is extreme — the point is the sequence of what the
        flow passed through, not the gradient.
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 820 372"
          className="w-full min-w-[560px] h-auto"
          role="img"
          aria-label="Schematic longitudinal profile of the August 2026 Rasuwa flood path, from the glacier detachment zone at about 5,200 metres, through Rasuwagadhi and Timure, Syabrubesi, Trishuli in Nuwakot, Dhading, and down to Chitwan at about 200 metres."
        >
          <defs>
            <linearGradient id="rvp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rvp-rock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="rvp-flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="55%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="820" height="372" fill="url(#rvp-sky)" />

          {/* Terrain body */}
          <path d={`${TERRAIN} L 810 340 L 20 340 Z`} fill="url(#rvp-rock)" />
          <path d={TERRAIN} fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />

          {/* Ice cap at the detachment zone */}
          <path d="M 44 78 L 70 56 L 100 82 Z" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />

          {/* The debris flow, drawn just under the terrain line */}
          <m.path
            d={TERRAIN}
            fill="none"
            stroke="url(#rvp-flow)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
            initial={reduce ? undefined : { pathLength: 0 }}
            whileInView={reduce ? undefined : { pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
          {!reduce && (
            <m.path
              d={TERRAIN}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="10 26"
              strokeLinecap="round"
              opacity="0.75"
              animate={{ strokeDashoffset: [0, -72] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Nodes */}
          {NODES.map((n, i) => (
            <m.g
              key={n.name}
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.22 }}
            >
              <line
                x1={n.x}
                y1={n.y}
                x2={n.x}
                y2={n.y + 34}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx={n.x} cy={n.y} r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
              <text
                x={n.x}
                y={n.y + 50}
                textAnchor="middle"
                className="fill-gray-900 dark:fill-white"
                fontSize="12"
                fontWeight="600"
              >
                {n.name}
              </text>
              <text
                x={n.x}
                y={n.y + 65}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
              >
                {n.elev}
              </text>
              <text
                x={n.x}
                y={n.y + 80}
                textAnchor="middle"
                className="fill-gray-400 dark:fill-gray-500"
                fontSize="10"
              >
                {n.note.length > 34 ? `${n.note.slice(0, 33)}…` : n.note}
              </text>
            </m.g>
          ))}

          {/* Direction label */}
          <text
            x="812"
            y="26"
            textAnchor="end"
            className="fill-gray-400 dark:fill-gray-500"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
          >
            downstream →
          </text>
        </svg>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-4 leading-relaxed">
        Elevations are approximate settlement elevations, included for scale. Every place on this line
        received the flow within hours of the detachment.
      </p>
    </ChartCard>
  )
}
