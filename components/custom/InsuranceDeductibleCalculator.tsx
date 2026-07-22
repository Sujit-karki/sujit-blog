'use client'

// Default premium $3,057 — Insurify 2026 average home-insurance premium.
// Deductible-tier discount factors are illustrative, based on commonly published
// industry ranges (Insurance.com, NAIC consumer guides), not one insurer's real rate table.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const TIERS = [500, 1000, 1500, 2500, 5000] as const
const FACTOR: Record<number, number> = {
  500: 1.0,
  1000: 0.88,
  1500: 0.81,
  2500: 0.75,
  5000: 0.65,
}

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function InsuranceDeductibleCalculator() {
  const [premium, setPremium] = useState(3057)
  const [currentDeductible, setCurrentDeductible] = useState(1000)
  const [newDeductible, setNewDeductible] = useState(2500)
  const [claimEveryYears, setClaimEveryYears] = useState(8)

  const result = useMemo(() => {
    const newPremium = premium * (FACTOR[newDeductible] / FACTOR[currentDeductible])
    const annualSavings = premium - newPremium
    const extraRiskPerClaim = newDeductible - currentDeductible
    const breakevenYears = annualSavings > 0 ? extraRiskPerClaim / annualSavings : Infinity
    const worthIt = annualSavings > 0 && claimEveryYears >= breakevenYears
    return { newPremium, annualSavings, extraRiskPerClaim, breakevenYears, worthIt }
  }, [premium, currentDeductible, newDeductible, claimEveryYears])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · should you raise your deductible?
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        The deductible math nobody shows you
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Current annual premium</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(premium)}</b>
          </div>
          <input
            type="range" min={800} max={8000} step={50} value={premium}
            onChange={e => setPremium(+e.target.value)}
            className="w-full accent-sky-600"
          />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">Current deductible</p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {TIERS.map(t => (
              <button
                key={t}
                onClick={() => setCurrentDeductible(t)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  currentDeductible === t
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {money(t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">Considering raising it to</p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {TIERS.map(t => (
              <button
                key={t}
                onClick={() => setNewDeductible(t)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  newDeductible === t
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {money(t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>You file a claim about once every</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{claimEveryYears} yrs</b>
          </div>
          <input
            type="range" min={1} max={20} step={1} value={claimEveryYears}
            onChange={e => setClaimEveryYears(+e.target.value)}
            className="w-full accent-sky-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          {result.annualSavings <= 0 ? (
            <>That change doesn&apos;t lower your premium in this model — try raising the new deductible above your current one.</>
          ) : (
            <>
              Raising your deductible saves about{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={result.annualSavings} format={v => money(v) + '/yr'} startFromZero />
              </strong>
              , but costs {money(result.extraRiskPerClaim)} more out of pocket per claim. Breakeven is about{' '}
              <strong>{result.breakevenYears.toFixed(1)} years</strong> between claims —{' '}
              {result.worthIt ? (
                <strong className="text-emerald-600 dark:text-emerald-400">worth it at your claim frequency.</strong>
              ) : (
                <strong className="text-red-500 dark:text-red-400">not worth it if you claim that often.</strong>
              )}
            </>
          )}
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">New annual premium at {money(newDeductible)} deductible</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.newPremium)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-sky-600 dark:bg-sky-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.newPremium / premium) * 100)}%` }}
            />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Current premium at {money(currentDeductible)} deductible</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(premium)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="h-full bg-gray-500 dark:bg-gray-400 rounded-lg transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Deductible-tier discounts are illustrative industry-typical ranges, not a quote — insurers price this differently by state, carrier, and claims history. Default premium ({money(3057)}) is the Insurify 2026 national average home-insurance estimate. Get an actual quote before changing your policy.
        </p>
      </div>
    </div>
  )
}
