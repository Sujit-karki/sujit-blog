'use client'

import { useState } from 'react'

const CONTRIB = 7500
const GROWTH_RATE = 0.07

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function RothIraCalculator() {
  const [nowRate, setNowRate] = useState(22)
  const [laterRate, setLaterRate] = useState(15)
  const [years, setYears] = useState(25)

  const growth = Math.pow(1 + GROWTH_RATE, years)
  const rothFinal = CONTRIB * (1 - nowRate / 100) * growth
  const tradFinal = CONTRIB * growth * (1 - laterRate / 100)
  const max = Math.max(rothFinal, tradFinal)
  const diff = Math.abs(rothFinal - tradFinal)
  const tiedThreshold = Math.abs(nowRate - laterRate) < 1

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · set your situation
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Which account likely wins for you
      </p>

      {/* Sliders */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Tax rate today</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{nowRate}%</b>
          </div>
          <input
            type="range" min={10} max={37} step={1} value={nowRate}
            onChange={e => setNowRate(+e.target.value)}
            className="w-full accent-blue-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Tax rate in retirement</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{laterRate}%</b>
          </div>
          <input
            type="range" min={0} max={37} step={1} value={laterRate}
            onChange={e => setLaterRate(+e.target.value)}
            className="w-full accent-amber-600"
          />
        </div>

        {/* Segmented years */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-3">Years until retirement</p>
          <div className="inline-flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {[15, 25, 35].map(y => (
              <button
                key={y}
                onClick={() => setYears(y)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  years === y
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {y} yrs
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-xl sm:text-2xl leading-snug mb-4 text-gray-900 dark:text-white">
          {tiedThreshold ? (
            <>It&apos;s a <strong>tie.</strong> Your tax rate is the same now and later, so both accounts leave you with the exact same amount.</>
          ) : nowRate < laterRate ? (
            <>The <strong className="text-blue-600 dark:text-blue-400">Roth IRA</strong> wins — by about {money(diff)} in spendable retirement money.</>
          ) : (
            <>The <strong className="text-amber-600 dark:text-amber-500">Traditional IRA</strong> wins — by about {money(diff)} in spendable retirement money.</>
          )}
        </p>

        {/* Roth bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Roth IRA — spendable in retirement</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(rothFinal)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-lg transition-all duration-500"
              style={{ width: `${(rothFinal / max) * 100}%` }}
            />
          </div>
        </div>

        {/* Traditional bar */}
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Traditional IRA — spendable in retirement</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(tradFinal)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-amber-500 dark:bg-amber-400 rounded-lg transition-all duration-500"
              style={{ width: `${(tradFinal / max) * 100}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          {tiedThreshold
            ? 'When today\'s rate equals your retirement rate, Roth and Traditional are mathematically identical. The tie-breakers become flexibility, required withdrawals, and certainty.'
            : nowRate < laterRate
            ? 'Your tax rate is lower now than in retirement, so paying the tax today (Roth) and withdrawing tax-free later comes out ahead.'
            : 'Your tax rate is higher now than in retirement, so taking the deduction today (Traditional) and paying the lower rate later comes out ahead.'}
          {' '}Assumes $7,500 contributed once at 7% annual growth.
        </p>
      </div>
    </div>
  )
}
