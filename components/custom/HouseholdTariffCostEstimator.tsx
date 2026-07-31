'use client'

// Category pass-through rates are long-run price-effect estimates reported
// from The Budget Lab at Yale's rolling tariff analysis (see post Sources):
// apparel ~17%, consumer electronics ~6% long-run (short-run spikes have
// been reported far higher, 17-18%), motor vehicles ~5% long-run (~$2,500
// on an average new car; short-run estimates have run higher), groceries
// ~2.8% across 2025-2026 tariffs, food commodities. These are national
// averages that change as tariff policy and court rulings change — treat
// this as a way to see how a mix of spending translates into a rough
// tariff pass-through, not a precise personal forecast.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

interface Category {
  key: string
  label: string
  rate: number // long-run estimated price pass-through, %
  defaultSpend: number
  max: number
}

const CATEGORIES: Category[] = [
  { key: 'groceries', label: 'Groceries', rate: 2.8, defaultSpend: 6000, max: 15000 },
  { key: 'electronics', label: 'Electronics', rate: 6, defaultSpend: 800, max: 5000 },
  { key: 'clothing', label: 'Clothing', rate: 17, defaultSpend: 1200, max: 5000 },
  { key: 'autos', label: 'Autos (purchase, parts, maintenance)', rate: 5, defaultSpend: 3000, max: 15000 },
]

const YALE_AVERAGE = 1100 // Budget Lab at Yale, average household estimate, ~ July 2026 snapshot

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function HouseholdTariffCostEstimator() {
  const [spend, setSpend] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, c.defaultSpend]))
  )

  const { breakdown, total } = useMemo(() => {
    const rows = CATEGORIES.map((c) => ({
      ...c,
      cost: (spend[c.key] * c.rate) / 100,
    }))
    return { breakdown: rows, total: rows.reduce((sum, r) => sum + r.cost, 0) }
  }, [spend])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · rough tariff pass-through by category
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What does your spending mix actually cost you in tariffs?
      </p>

      <div className="space-y-5 mb-6">
        {CATEGORIES.map((c) => (
          <div key={c.key}>
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
              <span>{c.label} — annual spend</span>
              <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(spend[c.key])}</b>
            </div>
            <input
              type="range" min={0} max={c.max} step={50} value={spend[c.key]}
              onChange={e => setSpend((s) => ({ ...s, [c.key]: +e.target.value }))}
              className="w-full accent-amber-600"
            />
          </div>
        ))}
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          At these pass-through rates, your spending mix implies about{' '}
          <strong className="text-amber-600 dark:text-amber-500">
            <AnimatedNumber value={total} format={v => money(v)} startFromZero />/year
          </strong>{' '}
          in tariff-driven price increases — {total > YALE_AVERAGE ? 'above' : 'below'} the Budget Lab at Yale&apos;s own average household estimate of {money(YALE_AVERAGE)}.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Estimated annual tariff cost by category</caption>
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Annual spend</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Est. pass-through rate</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Est. annual tariff cost</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((r) => (
                <tr key={r.key} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{r.label}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{money(spend[r.key])}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{r.rate}%</td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(r.cost)}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">Total</td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{money(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Category pass-through rates are long-run estimates reported from The Budget Lab at Yale&apos;s tariff analysis and move as tariff policy and court rulings change (see Sources below) — this covers only these four goods categories, not your full household budget, and ignores services, which face much smaller indirect tariff effects.
        </p>
        <p className="text-xs text-gray-400 mt-2">Estimate only — not financial advice.</p>
      </div>
    </div>
  )
}
