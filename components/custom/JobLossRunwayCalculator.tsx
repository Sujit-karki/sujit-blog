'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function JobLossRunwayCalculator() {
  const [monthlyEssentials, setMonthlyEssentials] = useState(3000)
  const [currentSavings, setCurrentSavings] = useState(9000)
  const [severanceMonths, setSeveranceMonths] = useState(0)
  const [sideIncome, setSideIncome] = useState(0)

  const result = useMemo(() => {
    const netMonthlyBurn = Math.max(monthlyEssentials - sideIncome, 1)
    const totalCushion = currentSavings + severanceMonths * monthlyEssentials
    const runwayMonths = totalCushion / netMonthlyBurn
    const targetMonths = 6
    const gapToTarget = Math.max(0, targetMonths * netMonthlyBurn - totalCushion)
    return { runwayMonths, gapToTarget }
  }, [monthlyEssentials, currentSavings, severanceMonths, sideIncome])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · your job-loss runway
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How many months could you cover?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Essential monthly expenses</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(monthlyEssentials)}</b>
          </div>
          <input type="range" min={500} max={10000} step={100} value={monthlyEssentials} onChange={(e) => setMonthlyEssentials(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Current savings</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(currentSavings)}</b>
          </div>
          <input type="range" min={0} max={60000} step={500} value={currentSavings} onChange={(e) => setCurrentSavings(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Severance (months of pay)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{severanceMonths}</b>
          </div>
          <input type="range" min={0} max={6} step={1} value={severanceMonths} onChange={(e) => setSeveranceMonths(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Side income while job hunting</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(sideIncome)}/mo</b>
          </div>
          <input type="range" min={0} max={4000} step={100} value={sideIncome} onChange={(e) => setSideIncome(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At this burn rate, your cushion covers roughly{' '}
          <strong className={result.runwayMonths >= 6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
            <AnimatedNumber value={result.runwayMonths} format={(v) => v.toFixed(1) + ' months'} />
          </strong>
          {result.gapToTarget > 0 && (
            <>
              {' '}— you&apos;d need another{' '}
              <strong className="text-gray-900 dark:text-white">
                <AnimatedNumber value={result.gapToTarget} format={money} startFromZero />
              </strong>{' '}
              to reach a 6-month cushion.
            </>
          )}
          {result.gapToTarget === 0 && <> — that already clears the 6-month benchmark most planners recommend.</>}
        </p>

        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Runway vs. 6-month target</span>
            <span className="font-medium text-gray-900 dark:text-white">{result.runwayMonths.toFixed(1)} / 6 months</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${result.runwayMonths >= 6 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-amber-500 dark:bg-amber-400'}`}
              style={{ width: `${Math.min(100, (result.runwayMonths / 6) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Uses a common 3–6 month emergency-fund benchmark. Your right number depends on job security, industry, and household situation — not a one-size formula.
        </p>
      </div>
    </div>
  )
}
