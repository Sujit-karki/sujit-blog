'use client'

import { useState } from 'react'
import { m } from 'motion/react'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

const SE_TAX_RATE = 0.153
const NET_EARNINGS_FACTOR = 0.9235
const BRACKETS = [12, 22, 24, 32]

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function SideHustleTaxEstimator() {
  const [monthly, setMonthly] = useState(1500)
  const [bracket, setBracket] = useState(22)

  const annual = monthly * 12
  const seTaxableBase = annual * NET_EARNINGS_FACTOR
  const seTax = seTaxableBase * SE_TAX_RATE
  const incomeTaxReserve = annual * (bracket / 100)
  const totalReserve = seTax + incomeTaxReserve
  const takeHome = Math.max(0, annual - totalReserve)
  const perQuarter = totalReserve / 4
  const reservePct = annual > 0 ? (totalReserve / annual) * 100 : 0

  const segments = [
    { label: 'Take-home', val: takeHome, color: '#059669' },
    { label: 'Self-employment tax', val: seTax, color: '#f59e0b' },
    { label: `Income tax (~${bracket}%)`, val: incomeTaxReserve, color: '#6366f1' },
  ]

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · plug in your numbers
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much should you actually set aside?
      </p>

      {/* Controls */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Average monthly side-hustle profit</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(monthly)}</b>
          </div>
          <input
            type="range" min={100} max={5000} step={50} value={monthly}
            onChange={e => setMonthly(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Your income tax bracket (rough estimate)
          </p>
          <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {BRACKETS.map(b => (
              <button
                key={b}
                onClick={() => setBracket(b)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  bracket === b
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {b}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animated stacked bar */}
      <div className="mb-5">
        <div className="h-9 w-full rounded-lg overflow-hidden flex bg-gray-200 dark:bg-gray-700">
          {segments.map(seg => (
            <m.div
              key={seg.label}
              className="h-full flex items-center justify-center overflow-hidden"
              style={{ background: seg.color }}
              initial={{ width: 0 }}
              animate={{ width: `${annual > 0 ? (seg.val / annual) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {seg.val / annual > 0.14 && (
                <span className="text-[10px] font-bold text-white whitespace-nowrap px-1">
                  {Math.round((seg.val / annual) * 100)}%
                </span>
              )}
            </m.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          {segments.map(seg => (
            <div key={seg.label} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
              {seg.label}: <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{money(seg.val)}/yr</span>
            </div>
          ))}
        </div>
      </div>

      {/* Readout cards */}
      <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Set aside per quarter</p>
          <AnimatedNumber
            value={perQuarter}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total tax reserve</p>
          <AnimatedNumber
            value={reservePct}
            format={v => `${Math.round(v)}% of profit`}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white block"
          />
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
        Simplified estimate: self-employment tax at 15.3% of 92.35% of net profit, plus your selected income-tax bracket applied to the full amount. Ignores deductions, the QBI deduction, and the Social Security wage base cap — a real return will differ. Move a portion into a separate savings account the moment you&apos;re paid.
      </p>
    </ChartCard>
  )
}
