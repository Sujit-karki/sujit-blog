'use client'

// Longitudinal profile of the flood path, from the detachment zone on the
// Nepal–Tibet border down to the Chitwan lowlands where bodies were later
// recovered. Elevations are approximate published settlement elevations,
// drawn to a compressed vertical scale so the whole path fits — this is a
// schematic, not a survey.
//
// Labels alternate between two tiers. At six nodes across this width the
// label blocks are wider than the node spacing, so a single tier collides
// (and the rightmost one clips the viewBox edge). Staggering is the fix.

import { m, useReducedMotion } from 'motion/react'
import ChartCard from './ChartCard'

interface Node {
  x: number
  y: number
  name: string
  elev: string
  note: string
}

// x = horizontal position in the 860-wide viewBox, y = the terrain line
const NODES: Node[] = [
  { x: 72, y: 62, name: 'Detachment zone', elev: '≈ 5,200 m', note: '~0.2 km² of ice breaks away' },
  { x: 200, y: 132, name: 'Rasuwagadhi / Timure', elev: '≈ 1,850 m', note: 'Customs office damaged' },
  { x: 330, y: 180, name: 'Syabrubesi', elev: '≈ 1,460 m', note: 'Langtang trek gateway' },
  { x: 470, y: 226, name: 'Trishuli / Nuwakot', elev: '≈ 600 m', note: '220 kV substation destroyed' },
  { x: 610, y: 258, name: 'Dhading', elev: '≈ 400 m', note: 'Bridges severed' },
  { x: 742, y: 286, name: 'Chitwan', elev: '≈ 200 m', note: 'Bodies recovered here' },
]

const TERRAIN =
  'M 24 98 L 72 62 L 136 104 L 200 132 L 265 158 L 330 180 L 400 204 L 470 226 L 540 244 L 610 258 L 742 286 L 836 302'

// Odd-indexed labels drop to a second tier so neighbouring blocks never overlap.
const TIER_DROP = 52

export default function RasuwaValleyProfile() {
  const reduce = useReducedMotion()

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
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
          viewBox="0 0 860 430"
          className="w-full min-w-[620px] h-auto"
          role="img"
          aria-label="Schematic longitudinal profile of the August 2026 Rasuwa flood path, from the glacier detachment zone at about 5,200 metres, through Rasuwagadhi and Timure, Syabrubesi, Trishuli in Nuwakot, Dhading, and down to Chitwan at about 200 metres."
        >
          <defs>
            <linearGradient id="rvp-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rvp-rock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="rvp-flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="55%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="860" height="430" fill="url(#rvp-sky)" />

          {/* Terrain body */}
          <path d={`${TERRAIN} L 836 400 L 24 400 Z`} fill="url(#rvp-rock)" />
          <path d={TERRAIN} fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />

          {/* Ice cap at the detachment zone */}
          <path d="M 46 80 L 72 58 L 102 84 Z" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />

          {/* The debris flow, drawn along the terrain line */}
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

          {/* Nodes, with labels staggered across two tiers */}
          {NODES.map((n, i) => {
            const drop = i % 2 === 1 ? TIER_DROP : 0
            const top = n.y + 34 + drop
            // Keep the last block's text inside the viewBox.
            const anchor = i === NODES.length - 1 ? 'end' : 'middle'
            const tx = i === NODES.length - 1 ? n.x + 90 : n.x

            return (
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
                  y2={top - 12}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle cx={n.x} cy={n.y} r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                <text
                  x={tx}
                  y={top + 4}
                  textAnchor={anchor}
                  className="fill-gray-900 dark:fill-white"
                  fontSize="13"
                  fontWeight="600"
                >
                  {n.name}
                </text>
                <text
                  x={tx}
                  y={top + 20}
                  textAnchor={anchor}
                  className="fill-gray-600 dark:fill-gray-300"
                  fontSize="12"
                  fontFamily="ui-monospace, monospace"
                >
                  {n.elev}
                </text>
                <text
                  x={tx}
                  y={top + 36}
                  textAnchor={anchor}
                  className="fill-gray-500 dark:fill-gray-400"
                  fontSize="11"
                >
                  {n.note}
                </text>
              </m.g>
            )
          })}

          {/* Direction label */}
          <text
            x="850"
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

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
        Elevations are approximate settlement elevations, included for scale. Every place on this line
        received the flow within hours of the detachment.
      </p>
    </ChartCard>
  )
}
