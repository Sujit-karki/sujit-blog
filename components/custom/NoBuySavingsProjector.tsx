'use client'

// Reduction-percentage defaults are illustrative tiers, not survey data:
// "no-buy" (~90% cut), "low-buy" (~50% cut), "soft-save" (~25% cut) map
// loosely to how Credit Karma's March 2024 survey described no-buy vs.
// low-buy behavior (see post Sources). They are starting points, not a
// formula — the sliders above them are what should reflect your own numbers.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

type Tier = 'no-buy' | 'low-buy' | 'soft-save'

const TIER_DEFAULTS: Record<Tier, { label: string; pct: number; desc: string }> = {
  'no-buy': { label: 'No-buy', pct: 90, desc: 'Cut almost everything discretionary except true replacements' },
  'low-buy': { label: 'Low-buy', pct: 50, desc: 'A hard cap on discretionary categories, not a freeze' },
  'soft-save': { label: 'Soft-save', pct: 25, desc: 'Modest, sustainable trims — the "diet, not detox" version' },
}

export default function NoBuySavingsProjector() {
  const [clothes, setClothes] = useState(120)
  const [dining, setDining] = useState(250)
  const [subscriptions, setSubscriptions] = useState(60)
  const [impulse, setImpulse] = useState(150)
  const [tier, setTier] = useState<Tier>('low-buy')
  const [reductionPct, setReductionPct] = useState(TIER_DEFAULTS['low-buy'].pct)

  function selectTier(t: Tier) {
    setTier(t)
    setReductionPct(TIER_DEFAULTS[t].pct)
  }

  const { totalDiscretionary, monthlySavings, annualSavings } = useMemo(() => {
    const total = clothes + dining + subscriptions + impulse
    const monthly = total * (reductionPct / 100)
    return { totalDiscretionary: total, monthlySavings: monthly, annualSavings: monthly * 12 }
  }, [clothes, dining, subscriptions, impulse, reductionPct])

  const categories: [string, number, (v: number) => void, number][] = [
    ['Clothes & shoes', clothes, setClothes, 500],
    ['Dining out / delivery', dining, setDining, 600],
    ['Subscriptions & streaming', subscriptions, setSubscriptions, 200],
    ['Impulse buys (Amazon, TikTok Shop, etc.)', impulse, setImpulse, 500],
  ]

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · project your own savings
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much would a no-buy year actually save you?
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Set your current monthly spend in each category, then pick an approach.
      </p>

      <div className="space-y-5 mb-6">
        {categories.map(([label, value, setter, max]) => (
          <div key={label}>
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              <span>{label}</span>
              <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(value)}/mo</b>
            </div>
            <input
              type="range" min={0} max={max} step={10} value={value}
              onChange={e => setter(+e.target.value)}
              className="w-full accent-emerald-600"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(Object.keys(TIER_DEFAULTS) as Tier[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => selectTier(t)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
              tier === t
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            {TIER_DEFAULTS[t].label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">{TIER_DEFAULTS[tier].desc}</p>

      <div>
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          <span>Reduction target (fine-tune it)</span>
          <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{reductionPct}%</b>
        </div>
        <input
          type="range" min={0} max={100} step={5} value={reductionPct}
          onChange={e => setReductionPct(+e.target.value)}
          className="w-full accent-emerald-600"
        />
      </div>

      <div className="pt-5 mt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Cutting {reductionPct}% of {money(totalDiscretionary)}/month in discretionary spend saves about{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">{money(monthlySavings)}/month</strong> —{' '}
          <strong>{money(annualSavings)}/year</strong>.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Monthly savings</p>
            <AnimatedNumber
              value={monthlySavings}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Annual savings</p>
            <AnimatedNumber
              value={annualSavings}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Estimate only — not financial advice. Assumes you actually hold the line.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">No-buy savings projection — data table</caption>
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Current / mo</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Saved / mo</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(([label, value]) => (
                <tr key={label} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{label}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{money(value)}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{money(value * (reductionPct / 100))}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-200 dark:border-gray-700 font-medium">
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">Total</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{money(totalDiscretionary)}</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{money(monthlySavings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
