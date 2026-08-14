'use client'

// 2026 charitable deduction under OBBBA §170(p): non-itemizers get an
// above-the-line deduction up to $1,000/$2,000 (cash only); itemizers face a
// new 0.5%-of-AGI floor, and the benefit of the deduction caps at 35% for
// anyone in the 37% bracket.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

const RATES = [12, 22, 24, 32, 35, 37]

export default function CharitableDeduction2026Estimator() {
  const [giftCash, setGiftCash] = useState(2000)
  const [agi, setAgi] = useState(80000)
  const [itemizes, setItemizes] = useState(false)
  const [rate, setRate] = useState(22)
  const [filingStatus, setFilingStatus] = useState<'mfj' | 'single'>('mfj')

  const { deductible, savings, effectiveRate } = useMemo(() => {
    const nonItemizerCap = filingStatus === 'mfj' ? 2000 : 1000
    let deductible: number
    if (!itemizes) {
      deductible = Math.min(giftCash, nonItemizerCap)
    } else {
      const floor = 0.005 * agi
      deductible = Math.max(0, giftCash - floor)
    }
    const effectiveRate = itemizes && rate === 37 ? 35 : rate
    const savings = deductible * (effectiveRate / 100)
    return { deductible, savings, effectiveRate }
  }, [giftCash, agi, itemizes, rate, filingStatus])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · estimate your 2026 charitable tax benefit
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What does your cash gift actually save you in 2026?
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          type="button" onClick={() => setItemizes(false)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!itemizes ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
        >
          I take the standard deduction
        </button>
        <button
          type="button" onClick={() => setItemizes(true)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${itemizes ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
        >
          I itemize
        </button>
      </div>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Cash gift to a 501(c)(3) charity</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(giftCash)}</b>
          </div>
          <input
            type="range" min={0} max={100000} step={100} value={giftCash}
            onChange={e => setGiftCash(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        {itemizes && (
          <div>
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
              <span>Adjusted gross income</span>
              <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(agi)}</b>
            </div>
            <input
              type="range" min={0} max={2000000} step={5000} value={agi}
              onChange={e => setAgi(+e.target.value)}
              className="w-full accent-emerald-600"
            />
          </div>
        )}
        {!itemizes && (
          <div className="flex gap-2">
            {(['single', 'mfj'] as const).map((s) => (
              <button
                key={s} type="button" onClick={() => setFilingStatus(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${filingStatus === s ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
              >
                {s === 'mfj' ? 'Married filing jointly' : 'Single'}
              </button>
            ))}
          </div>
        )}
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Marginal federal tax bracket</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{rate}%</b>
          </div>
          <input
            type="range" min={0} max={RATES.length - 1} step={1}
            value={RATES.indexOf(rate)}
            onChange={e => setRate(RATES[+e.target.value])}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Of your {money(giftCash)} gift, {money(deductible)} is deductible — worth about{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">{money(savings)}</strong> at a {effectiveRate}% rate.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Deductible amount</p>
            <AnimatedNumber
              value={deductible}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 mb-1">Estimated tax savings</p>
            <AnimatedNumber
              value={savings}
              format={v => money(v)}
              startFromZero
              className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Estimate only, not tax advice; cash gifts to 501(c)(3) public charities only.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">2026 charitable deduction estimate — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Filer type</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{itemizes ? 'Itemizer' : 'Non-itemizer'}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Cash gift</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(giftCash)}</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Deductible amount</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(deductible)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">Estimated tax savings</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(savings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
