'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

// Approximate monthly BTC price snapshots, Oct 2025 peak through Jul 15, 2026.
// Illustrative — rounded to the nearest reported monthly reference point, not daily closes.
const PRICES = [
  { month: 'Oct 2025', label: 'the peak', price: 126198 },
  { month: 'Nov 2025', label: 'Nov 2025', price: 91000 },
  { month: 'Dec 2025', label: 'the first crash', price: 82500 },
  { month: 'Jan 2026', label: 'Jan 2026', price: 71000 },
  { month: 'Feb 2026', label: 'the Feb low', price: 60062 },
  { month: 'Mar 2026', label: 'the low', price: 68000 },
  { month: 'Apr 2026', label: 'Apr 2026', price: 64500 },
  { month: 'May 2026', label: 'May 2026', price: 60800 },
  { month: 'Jun 2026', label: 'Jun 2026', price: 58115 },
  { month: 'Jul 2026', label: 'today', price: 64975 },
]

const CURRENT_PRICE = PRICES[PRICES.length - 1].price

const START_OPTIONS = [
  { idx: 0, label: 'At the peak' },
  { idx: 2, label: 'After the first crash' },
  { idx: 5, label: 'Near the low' },
]

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function BitcoinDrawdownCalculator() {
  const [startIdx, setStartIdx] = useState(0)
  const [monthlyAmount, setMonthlyAmount] = useState(200)

  const result = useMemo(() => {
    const months = PRICES.slice(startIdx)
    const totalInvested = monthlyAmount * months.length

    const dcaBtc = months.reduce((sum, m) => sum + monthlyAmount / m.price, 0)
    const dcaValue = dcaBtc * CURRENT_PRICE
    const avgCost = totalInvested / dcaBtc

    const lumpStartPrice = PRICES[startIdx].price
    const lumpBtc = totalInvested / lumpStartPrice
    const lumpValue = lumpBtc * CURRENT_PRICE

    const waitedValue = totalInvested // cash held, converted to BTC today at the current price

    const best = Math.max(dcaValue, lumpValue, waitedValue)

    return { totalInvested, dcaValue, avgCost, lumpValue, waitedValue, best, numMonths: months.length }
  }, [startIdx, monthlyAmount])

  const gain = (value: number) => ((value - result.totalInvested) / result.totalInvested) * 100

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · run your own numbers
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        DCA vs. lump sum vs. waiting on the sidelines
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-3">
            When did you start buying?
          </p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {START_OPTIONS.map(opt => (
              <button
                key={opt.idx}
                onClick={() => setStartIdx(opt.idx)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  startIdx === opt.idx
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Starting{startIdx === 0 ? ' at the October 2025 peak' : ` around ${PRICES[startIdx].month}`}
            {' '}({money(PRICES[startIdx].price)}) through today ({money(CURRENT_PRICE)}) — {result.numMonths} months.
          </p>
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Monthly amount</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(monthlyAmount)}</b>
          </div>
          <input
            type="range" min={50} max={1000} step={25} value={monthlyAmount}
            onChange={e => setMonthlyAmount(+e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          On <AnimatedNumber value={result.totalInvested} format={money} startFromZero className="font-bold" /> invested,
          {' '}dollar-cost averaging would be worth about{' '}
          <strong className={result.dcaValue >= result.totalInvested ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
            {money(result.dcaValue)}
          </strong>{' '}today ({gain(result.dcaValue) >= 0 ? '+' : ''}{gain(result.dcaValue).toFixed(0)}%).
        </p>

        {/* DCA bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Dollar-cost averaged in monthly · avg cost {money(result.avgCost)}</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.dcaValue)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.dcaValue / result.best) * 100)}%` }}
            />
          </div>
        </div>

        {/* Lump sum bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">All in on day one, at {PRICES[startIdx].month} price</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.lumpValue)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-amber-500 dark:bg-amber-400 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.lumpValue / result.best) * 100)}%` }}
            />
          </div>
        </div>

        {/* Waited bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Waited in cash, bought it all today</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.waitedValue)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gray-500 dark:bg-gray-400 rounded-lg transition-all duration-500"
              style={{ width: `${Math.max(4, (result.waitedValue / result.best) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Illustrative only, using approximate monthly BTC reference prices from Oct 2025 to Jul 15, 2026 ({money(CURRENT_PRICE)}). Past performance over one specific stretch of one specific asset says nothing about what happens next — this tool is for building intuition about DCA mechanics, not a return forecast. Ignores fees and taxes.
        </p>
      </div>
    </div>
  )
}
