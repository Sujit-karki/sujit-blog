'use client'

import { useState, useMemo } from 'react'
import { m } from 'motion/react'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

// Equal-weight comparison: the Magnificent Seven's combined weight in an
// equal-weight S&P 500 index is ~7 holdings / 500 ≈ 1.4%, vs. their
// cap-weighted share of roughly a third of the index (July 2026).
const EQUAL_WEIGHT_PCT = 1.4

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function AIExposureCalculator() {
  const [portfolioValue, setPortfolioValue] = useState(100000)
  const [mag7WeightPct, setMag7WeightPct] = useState(32.5)

  const result = useMemo(() => {
    const capWeightedExposure = portfolioValue * (mag7WeightPct / 100)
    const equalWeightExposure = portfolioValue * (EQUAL_WEIGHT_PCT / 100)
    const difference = capWeightedExposure - equalWeightExposure
    return { capWeightedExposure, equalWeightExposure, difference }
  }, [portfolioValue, mag7WeightPct])

  const maxBar = Math.max(result.capWeightedExposure, result.equalWeightExposure, 1)

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · what your index fund actually owns
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Your real Magnificent Seven exposure
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your equity portfolio value</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {money(portfolioValue)}
            </b>
          </div>
          <input
            type="range" min={0} max={10000000} step={1000} value={portfolioValue}
            onChange={(e) => setPortfolioValue(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Magnificent Seven weight in your S&amp;P 500 fund</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {mag7WeightPct.toFixed(1)}%
            </b>
          </div>
          <input
            type="range" min={25} max={40} step={0.5} value={mag7WeightPct}
            onChange={(e) => setMag7WeightPct(+e.target.value)}
            className="w-full accent-indigo-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Default 32.5% reflects the cap-weighted S&amp;P 500 in July 2026 — check your fund&apos;s actual weight for a precise figure.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Cap-weighted fund (e.g. VOO, SPY)</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.capWeightedExposure)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <m.div
              className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-lg"
              initial={{ width: 0 }}
              animate={{ width: `${(result.capWeightedExposure / maxBar) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Equal-weight fund (e.g. RSP)</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.equalWeightExposure)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <m.div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg"
              initial={{ width: 0 }}
              animate={{ width: `${(result.equalWeightExposure / maxBar) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-1">
          Extra Mag 7 dollars from cap-weighting alone
        </p>
        <AnimatedNumber
          value={result.difference}
          format={money}
          startFromZero
          className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white block"
        />
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-4 leading-relaxed">
        Estimate for illustration, not financial advice. Actual fund weights vary by index and change daily.
      </p>
    </ChartCard>
  )
}
