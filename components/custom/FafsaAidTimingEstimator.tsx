'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const MONTHS = ['October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June']
// Illustrative decay curve: many state/college aid pools are first-come,
// first-served, so modeled "relative availability" declines the later you file.
const AVAILABILITY = [100, 92, 84, 74, 62, 48, 34, 20, 8]

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function FafsaAidTimingEstimator() {
  const [monthIndex, setMonthIndex] = useState(0)
  const [stateAidPool, setStateAidPool] = useState(5000)

  const result = useMemo(() => {
    const availabilityPct = AVAILABILITY[monthIndex]
    const estimatedAid = (stateAidPool * availabilityPct) / 100
    return { availabilityPct, estimatedAid }
  }, [monthIndex, stateAidPool])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · illustrative, not a guarantee
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Why filing month matters for first-come, first-served aid
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Month you file</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{MONTHS[monthIndex]}</b>
          </div>
          <input type="range" min={0} max={MONTHS.length - 1} step={1} value={monthIndex} onChange={(e) => setMonthIndex(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Illustrative aid pool you&apos;re eligible for</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(stateAidPool)}</b>
          </div>
          <input type="range" min={500} max={20000} step={250} value={stateAidPool} onChange={(e) => setStateAidPool(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Filing in {MONTHS[monthIndex]} lands you in a period modeled at roughly{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.availabilityPct} format={(v) => v.toFixed(0) + '%'} />
          </strong>{' '}
          of first-come, first-served aid still available — an illustrative{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.estimatedAid} format={money} startFromZero />
          </strong>{' '}
          of the pool you&apos;d be chasing.
        </p>

        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Relative aid availability</span>
            <span className="font-medium text-gray-900 dark:text-white">{result.availabilityPct}%</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${result.availabilityPct}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Illustrative only — a model of how first-come, first-served pools typically deplete, not a real allocation curve for any specific school or state. Your actual aid depends on your FAFSA, your school, and your state&apos;s rules.
        </p>
      </div>
    </div>
  )
}
