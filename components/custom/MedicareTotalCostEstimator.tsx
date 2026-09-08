'use client'

// Rough total-annual-cost comparator: Original Medicare + Medigap vs. Medicare
// Advantage. 2027 Part B premium is a Trustees-report projection (~$209.50),
// not yet confirmed by CMS as of this writing — flagged in the UI.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

const PART_B_PROJECTED_2027 = 209.5

const OOP_ESTIMATE: Record<'low' | 'moderate' | 'high', number> = {
  low: 800,
  moderate: 3500,
  high: 7500,
}

const ORIGINAL_OOP_ESTIMATE: Record<'low' | 'moderate' | 'high', number> = {
  low: 300,
  moderate: 1200,
  high: 2500,
}

export default function MedicareTotalCostEstimator() {
  const [maPremium, setMaPremium] = useState(0)
  const [medigapPremium, setMedigapPremium] = useState(150)
  const [expectedCare, setExpectedCare] = useState<'low' | 'moderate' | 'high'>('moderate')
  const [maOopMax, setMaOopMax] = useState(8000)

  const { advantageAnnual, originalAnnual } = useMemo(() => {
    const partB = PART_B_PROJECTED_2027 * 12
    const advantageOop = Math.min(OOP_ESTIMATE[expectedCare], maOopMax)
    const advantageAnnual = partB + maPremium * 12 + advantageOop
    const originalAnnual = partB + medigapPremium * 12 + ORIGINAL_OOP_ESTIMATE[expectedCare]
    return { advantageAnnual, originalAnnual }
  }, [maPremium, medigapPremium, expectedCare, maOopMax])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · compare estimated 2027 total cost
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Medicare Advantage vs. Original Medicare + Medigap
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Medicare Advantage monthly premium</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(maPremium)}</b>
          </div>
          <input type="range" min={0} max={400} step={5} value={maPremium} onChange={e => setMaPremium(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Medigap monthly premium</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(medigapPremium)}</b>
          </div>
          <input type="range" min={0} max={500} step={5} value={medigapPremium} onChange={e => setMedigapPremium(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Medicare Advantage annual OOP maximum</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(maOopMax)}</b>
          </div>
          <input type="range" min={0} max={20000} step={500} value={maOopMax} onChange={e => setMaOopMax(+e.target.value)} className="w-full accent-emerald-600" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['low', 'moderate', 'high'] as const).map((level) => (
            <button
              key={level} type="button" onClick={() => setExpectedCare(level)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${expectedCare === level ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
            >
              {level === 'low' ? 'Light care year' : level === 'moderate' ? 'Moderate care year' : 'Heavy care year'}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Medicare Advantage, est. annual</p>
            <AnimatedNumber value={advantageAnnual} format={v => money(v)} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Original + Medigap, est. annual</p>
            <AnimatedNumber value={originalAnnual} format={v => money(v)} startFromZero className="font-serif text-2xl font-bold text-gray-900 dark:text-white" />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Includes a projected 2027 Part B premium of {money(PART_B_PROJECTED_2027)}/month (2026 Medicare Trustees Report) —
          CMS has not yet confirmed the final figure as of this writing. Estimate only, not insurance advice; compare real
          plans at medicare.gov/plan-compare.
        </p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Medicare total cost comparison — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Projected 2027 Part B (shared base cost)</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(PART_B_PROJECTED_2027 * 12)}/yr</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Medicare Advantage est. annual total</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(advantageAnnual)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Original + Medigap est. annual total</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(originalAnnual)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
