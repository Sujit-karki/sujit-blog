'use client'

import { useState, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { m } from 'motion/react'
import type { ChartData, ChartOptions } from 'chart.js'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

ChartJS.register(ArcElement, Tooltip, Legend)

// S&P Dow Jones Indices / GICS sector weights, approx. mid-July 2026.
const SECTORS = [
  { label: 'Information Technology', pct: 33, color: '#6366f1' },
  { label: 'Financials', pct: 14, color: '#059669' },
  { label: 'Consumer Discretionary', pct: 11, color: '#f59e0b' },
  { label: 'Communication Services', pct: 10, color: '#ef4444' },
  { label: 'Health Care', pct: 9, color: '#0ea5e9' },
  { label: 'Industrials', pct: 9, color: '#a855f7' },
  { label: 'Other 5 sectors', pct: 14, color: '#6b7280' },
]

// Approximate IT-sector weight carried by each building block, used only to
// illustrate the barbell mechanic — not a precise look-through holdings analysis.
const CORE = { label: 'S&P 500 core (SPY)', techPct: 33 }
const SATELLITES = [
  { label: 'Equal Weight (RSP)', techPct: 14 },
  { label: 'Mid-Cap (IJH)', techPct: 18 },
  { label: "Developed Int'l (VEA)", techPct: 9 },
  { label: 'Value (VTV)', techPct: 9 },
]
const SATELLITE_AVG_TECH =
  SATELLITES.reduce((sum, s) => sum + s.techPct, 0) / SATELLITES.length

function pct(v: number): string {
  return `${v.toFixed(1)}%`
}

export default function TechConcentrationExplorer() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [corePct, setCorePct] = useState(60)

  const satellitePct = 100 - corePct
  const effectiveTech = useMemo(
    () => (corePct / 100) * CORE.techPct + (satellitePct / 100) * SATELLITE_AVG_TECH,
    [corePct, satellitePct]
  )

  const data: ChartData<'doughnut'> = {
    labels: SECTORS.map(s => s.label),
    datasets: [
      {
        data: SECTORS.map(s => s.pct),
        backgroundColor: SECTORS.map(s => s.color),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 10,
        spacing: 2,
        borderRadius: 4,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutQuart' },
    onHover: (_evt, elements) => setHoverIdx(elements[0]?.index ?? null),
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(3,7,18,0.92)',
        padding: 10,
        displayColors: true,
        boxPadding: 4,
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: item => `${item.label}: ${item.raw}%`,
        },
      },
    },
  }

  const activeSlice = hoverIdx !== null ? SECTORS[hoverIdx] : null

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · S&amp;P 500 concentration
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Tech Concentration Explorer
      </p>

      <div className="grid sm:grid-cols-[minmax(0,220px)_1fr] gap-6 items-center">
        {/* Sector doughnut */}
        <div className="relative h-52 sm:h-56 mx-auto w-full max-w-[220px]">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatedNumber
              value={activeSlice ? activeSlice.pct : 33}
              format={v => `${Math.round(v)}%`}
              startFromZero
              className="font-serif text-3xl font-bold text-gray-900 dark:text-white"
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mt-1 text-center px-2">
              {activeSlice ? activeSlice.label : 'Information Technology'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {SECTORS.map((s, i) => (
            <m.div
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 border transition-colors ${
                hoverIdx === i
                  ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {s.label}
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white shrink-0">
                {s.pct}%
              </span>
            </m.div>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-3 leading-relaxed">
        GICS sector weights, S&amp;P Dow Jones Indices, approx. mid-July 2026. The Magnificent Seven alone were ~32.5% of the index; the concentration index (HHI) sits near 185–195 vs. ~123 at the March 2000 dot-com peak.
      </p>

      {/* Barbell allocator */}
      <div className="mt-6 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
          Try the barbell
        </p>
        <p className="font-serif text-lg mb-4 text-gray-900 dark:text-white">
          Dial your core vs. satellite mix
        </p>

        <div className="mb-5">
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>S&amp;P 500 core</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {corePct}%
            </b>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={corePct}
            onChange={e => setCorePct(+e.target.value)}
            className="w-full accent-indigo-600"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Remaining {satellitePct}% split evenly across equal-weight (RSP), mid-cap (IJH), developed international (VEA), and value (VTV).
          </p>
        </div>

        <p className="font-serif text-lg sm:text-xl leading-snug mb-3 text-gray-900 dark:text-white">
          Effective tech weight drops to{' '}
          <AnimatedNumber
            value={effectiveTech}
            format={pct}
            className={effectiveTech < 25 ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-bold text-gray-900 dark:text-white'}
          />
          {' '}— down from 33% in a plain S&amp;P 500 fund.
        </p>

        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-lg transition-all duration-500 flex items-center justify-end px-2"
            style={{ width: `${Math.max(8, (effectiveTech / 33) * 100)}%` }}
          >
            <span className="text-[10px] font-mono text-white/90">{pct(effectiveTech)}</span>
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 mt-3 leading-relaxed">
          Illustrative, using approximate IT-sector look-through weights per fund (S&amp;P 500 core ~33%, RSP ~14%, IJH ~18%, VEA ~9%, VTV ~9%). Not a precise holdings-level analysis — for building intuition about how diversifying across fund types dilutes concentration.
        </p>
      </div>
    </ChartCard>
  )
}
