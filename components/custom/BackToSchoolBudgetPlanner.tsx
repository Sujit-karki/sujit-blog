'use client'

// Baseline: NRF/Prosper Insights & Analytics 2026 back-to-school survey (press release
// dated July 14, 2026) — average K-12 family spend $863.86, up from $858.07 in 2025.
// Category split (electronics 33.9%, clothing 29.0%, shoes 20.1%, supplies 17.0%) is
// the real national average mix from that same release, applied proportionally here.
// The grade-mix and regional cost-of-living adjustments below are NOT NRF figures —
// NRF doesn't publish a grade-level breakdown — they're labeled planning assumptions.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const NRF_AVG_PER_CHILD = 863.86

const CATEGORY_SHARE = [
  { label: 'Electronics', share: 0.339, color: '#6366f1' },
  { label: 'Clothing & accessories', share: 0.29, color: '#f59e0b' },
  { label: 'Shoes', share: 0.201, color: '#059669' },
  { label: 'School supplies', share: 0.17, color: '#0d9488' },
]

const GRADE_MIX = {
  elementary: { label: 'Mostly elementary', mult: 0.85 },
  mixed: { label: 'Mixed grades', mult: 1.0 },
  secondary: { label: 'Mostly middle & high school', mult: 1.15 },
} as const

type GradeKey = keyof typeof GRADE_MIX

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function BackToSchoolBudgetPlanner() {
  const [kids, setKids] = useState(2)
  const [grade, setGrade] = useState<GradeKey>('mixed')
  const [regionMult, setRegionMult] = useState(1.0)

  const { total, categories } = useMemo(() => {
    const perChild = NRF_AVG_PER_CHILD * GRADE_MIX[grade].mult * regionMult
    const total = perChild * kids
    const categories = CATEGORY_SHARE.map((c) => ({
      ...c,
      amount: total * c.share,
    }))
    return { total, categories }
  }, [kids, grade, regionMult])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · plan your family&apos;s number
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What will back-to-school actually cost your family?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Number of K-12 kids</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{kids}</b>
          </div>
          <input
            type="range" min={1} max={5} step={1} value={kids}
            onChange={(e) => setKids(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">Grade level mix</p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {(Object.keys(GRADE_MIX) as GradeKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setGrade(key)}
                className={`font-mono text-[12px] tracking-wide px-3 py-2 border-none transition-colors ${
                  grade === key
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {GRADE_MIX[key].label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Assumption, not an NRF figure — NRF doesn&apos;t publish spend by grade. Older kids tend to run higher (more electronics, extracurricular gear).
          </p>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Regional cost-of-living adjustment</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {regionMult < 1 ? 'Lower-cost area' : regionMult > 1 ? 'Higher-cost area' : 'National average'}
            </b>
          </div>
          <input
            type="range" min={0.85} max={1.2} step={0.05} value={regionMult}
            onChange={(e) => setRegionMult(+e.target.value)}
            className="w-full accent-emerald-600"
          />
          <p className="text-xs text-gray-400 mt-1">Illustrative ±15–20% band, not a specific state or metro figure.</p>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Estimated total: <strong className="text-emerald-600 dark:text-emerald-400">{money(total)}</strong>
          {' '}for {kids} {kids === 1 ? 'kid' : 'kids'} this back-to-school season.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Your estimated total</p>
            <AnimatedNumber
              value={total}
              format={money}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Per kid</p>
            <AnimatedNumber
              value={kids > 0 ? total / kids : 0}
              format={money}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">Estimate only — not financial advice.</p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Back-to-school budget estimate — category breakdown</caption>
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Share (NRF 2026 avg.)</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Your estimate</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.label} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2 align-middle" style={{ background: c.color }} />
                    {c.label}
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{Math.round(c.share * 100)}%</td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(c.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-200 dark:border-gray-700 font-semibold">
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">Total</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{money(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
