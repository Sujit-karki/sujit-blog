'use client'

// Illustrative model of the reported surge: authorities recorded river levels
// rising by as much as 9 metres within 30 minutes. The curve here is a smooth
// interpolation to that single reported data point, not a gauge record — it
// exists to make "9 metres in 30 minutes" physically legible, and it is
// labelled as illustrative on the page.

import { useMemo, useState } from 'react'
import AnimatedNumber from './AnimatedNumber'

const PEAK_M = 9
const PEAK_MIN = 30

// Reference heights, in metres, for things a reader can picture.
const MARKERS = [
  { m: 1.7, label: 'An adult standing' },
  { m: 3.0, label: 'Single-storey roofline' },
  { m: 4.5, label: 'A loaded truck' },
  { m: 6.0, label: 'Two-storey house' },
  { m: 9.0, label: 'Reported peak rise' },
]

function levelAt(minutes: number): number {
  if (minutes <= 0) return 0
  const t = Math.min(minutes / PEAK_MIN, 1)
  // Smoothstep: slow start, steep middle, flattening at the reported peak.
  const s = t * t * (3 - 2 * t)
  const base = PEAK_M * s
  if (minutes <= PEAK_MIN) return base
  // Past the peak the flow stays high rather than draining instantly.
  return PEAK_M - (PEAK_M * 0.18 * (minutes - PEAK_MIN)) / 30
}

export default function RasuwaSurgeSimulator() {
  const [minutes, setMinutes] = useState(30)

  const level = useMemo(() => levelAt(minutes), [minutes])
  const submerged = MARKERS.filter((mk) => level >= mk.m)
  const fillPct = Math.min((level / 10) * 100, 100)

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · illustrative model
      </p>
      <p className="font-serif text-xl mb-1 text-gray-900 dark:text-white">
        What &ldquo;9 metres in 30 minutes&rdquo; actually looks like
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Drag the clock. The curve is an interpolation to the single reported figure — treat it as a way to
        picture the scale, not as a gauge record.
      </p>

      <div className="mb-6">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
          <span>Minutes since the surge front arrived</span>
          <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
            {minutes} min
          </b>
        </div>
        <input
          type="range"
          min={0}
          max={45}
          step={1}
          value={minutes}
          onChange={(e) => setMinutes(+e.target.value)}
          className="w-full accent-rose-600"
          aria-label="Minutes since the surge front arrived"
        />
        <div className="flex justify-between font-mono text-[10px] text-gray-400 mt-1">
          <span>0</span>
          <span>30 (reported peak)</span>
          <span>45</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-[160px_1fr] gap-5 items-stretch">
        {/* Water column */}
        <div className="relative h-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-rose-700 via-rose-500 to-amber-400 transition-[height] duration-300 ease-out"
            style={{ height: `${fillPct}%` }}
          />
          {MARKERS.map((mk) => (
            <div
              key={mk.m}
              className="absolute inset-x-0 border-t border-dashed border-gray-400/70 dark:border-gray-500/70"
              style={{ bottom: `${(mk.m / 10) * 100}%` }}
            >
              <span className="absolute right-1 -top-4 font-mono text-[9px] text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-950/80 px-1 rounded">
                {mk.m} m
              </span>
            </div>
          ))}
        </div>

        {/* Readout */}
        <div className="flex flex-col justify-between gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
              River level above normal
            </p>
            <AnimatedNumber
              value={level}
              format={(v) => `${v.toFixed(1)} m`}
              className="font-serif text-3xl font-bold text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Roughly {(level * 3.28).toFixed(0)} feet of mud, water, boulders and ice — not clear water.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-2">
              Under water at this level
            </p>
            {submerged.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nothing yet. This is the window in which a warning would have had to arrive.
              </p>
            ) : (
              <ul className="space-y-1">
                {submerged.map((mk) => (
                  <li
                    key={mk.m}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {mk.label}
                    <span className="font-mono text-[10px] text-gray-400">{mk.m} m</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-5 leading-relaxed">
        The entire useful evacuation window sits in the first few minutes of this slider. That is the whole
        argument for automated upstream sensing in this valley.
      </p>
    </div>
  )
}
