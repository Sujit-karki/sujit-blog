'use client'

// Default benefit $1,937.53 and the 3.6/3.7/3.8 scenarios are TSCL, AARP, and
// Mary Johnson's July 2026 estimates for the 2027 COLA — not the official SSA
// figure, which isn't announced until October 2026.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const SCENARIOS = [3.6, 3.7, 3.8] as const

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ColaBenefitEstimator() {
  const [currentBenefit, setCurrentBenefit] = useState(1937.53)
  const [cola, setCola] = useState<number>(3.8)
  const [medicarePartB, setMedicarePartB] = useState(6.6)

  const result = useMemo(() => {
    const newBenefit = currentBenefit * (1 + cola / 100)
    const monthlyRaise = newBenefit - currentBenefit
    const netRaise = monthlyRaise - medicarePartB
    return { newBenefit, monthlyRaise, netRaise }
  }, [currentBenefit, cola, medicarePartB])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · estimate your 2027 raise
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What your COLA is actually worth
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Your current monthly benefit</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(currentBenefit)}</b>
          </div>
          <input
            type="range" min={500} max={4500} step={1} value={currentBenefit}
            onChange={e => setCurrentBenefit(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">2027 COLA scenario</p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {SCENARIOS.map(s => (
              <button
                key={s}
                onClick={() => setCola(s)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  cola === s
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Expected Medicare Part B increase</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(medicarePartB)}/mo</b>
          </div>
          <input
            type="range" min={0} max={30} step={0.1} value={medicarePartB}
            onChange={e => setMedicarePartB(+e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At a {cola}% COLA, your benefit would rise to{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.newBenefit} format={v => money(v) + '/mo'} startFromZero />
          </strong>
          {' '}— a raise of {money(result.monthlyRaise)}/mo, or{' '}
          <strong>
            <AnimatedNumber value={result.netRaise} format={v => money(v) + '/mo'} startFromZero />
          </strong>{' '}
          net of the Medicare Part B increase you set above.
        </p>

        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
          Illustrative only — the SSA doesn&apos;t announce the official 2027 COLA until October 2026, and the 2027 Medicare Part B premium isn&apos;t finalized until around November 2026. Not financial advice.
        </p>
      </div>
    </div>
  )
}
