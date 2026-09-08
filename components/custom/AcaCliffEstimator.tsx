'use client'

// 400% FPL for a household of 1 ($62,600) is the widely-reported 2026 figure
// used in ACA subsidy-cliff coverage (KFF, CMS guidance). The per-person
// increment ($22,000 at the 400% level) is derived from the standard HHS
// poverty-guideline formula, not a household-size-specific published table —
// HHS updates the underlying guidelines every January, so re-verify before
// relying on this for a specific tax year.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const FPL_400_SIZE_1 = 62600
const FPL_400_PER_ADDITIONAL = 22000

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function fpl400(householdSize: number): number {
  return FPL_400_SIZE_1 + FPL_400_PER_ADDITIONAL * (householdSize - 1)
}

export default function AcaCliffEstimator() {
  const [householdIncome, setHouseholdIncome] = useState(60000)
  const [householdSize, setHouseholdSize] = useState(1)

  const result = useMemo(() => {
    const threshold = fpl400(householdSize)
    const pctOfFpl = (householdIncome / (threshold / 4)) * 100
    const overCliff = householdIncome >= threshold
    const headroom = threshold - householdIncome
    return { threshold, pctOfFpl, overCliff, headroom }
  }, [householdIncome, householdSize])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · are you near the subsidy cliff?
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        The 400% FPL cliff, for your household
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Household income (MAGI)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(householdIncome)}</b>
          </div>
          <input
            type="range" min={10000} max={300000} step={1000} value={householdIncome}
            onChange={e => setHouseholdIncome(+e.target.value)}
            className="w-full accent-sky-600"
          />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Household size</p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <button
                key={n}
                onClick={() => setHouseholdSize(n)}
                className={`font-mono text-[12px] tracking-wide px-3 py-2 border-none transition-colors ${
                  householdSize === n
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          You&apos;re at about{' '}
          <strong>
            <AnimatedNumber value={result.pctOfFpl} format={v => v.toFixed(0) + '% of the poverty line'} startFromZero />
          </strong>{' '}
          for a household of {householdSize}. The 400% cliff sits at {money(result.threshold)} —{' '}
          {result.overCliff ? (
            <strong className="text-red-600 dark:text-red-400 dark:text-red-400">you&apos;re over it, so you may not qualify for any premium subsidy.</strong>
          ) : (
            <>
              you have about{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">
                <AnimatedNumber value={result.headroom} format={v => money(v)} startFromZero />
              </strong>{' '}
              of headroom before losing subsidy eligibility entirely.
            </>
          )}
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Your income</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(householdIncome)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${result.overCliff ? 'bg-red-500 dark:bg-red-400' : 'bg-sky-600 dark:bg-sky-500'}`}
              style={{ width: `${Math.min(100, (householdIncome / result.threshold) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            <span>$0</span>
            <span>400% FPL: {money(result.threshold)}</span>
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
          Uses the widely-cited 2026 figure of {money(FPL_400_SIZE_1)} as 400% FPL for a household of one, scaled by the standard per-person HHS increment. Poverty guidelines update every January — verify against the current healthcare.gov figures before making coverage decisions. Not tax or insurance advice.
        </p>
      </div>
    </div>
  )
}
