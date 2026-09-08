'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

// Long-run approximate annualized figures used for illustration only:
// gold ~7.5% return / ~16% volatility; a diversified stock portfolio ~10% / ~15%;
// low historical gold-stock correlation (~0.05). Risk-free rate ~4% for the Sharpe estimate.
const GOLD_RETURN = 7.5
const GOLD_VOL = 16
const STOCK_RETURN = 10
const STOCK_VOL = 15
const CORRELATION = 0.05
const RISK_FREE = 4

function pct(v: number): string {
  return v.toFixed(1) + '%'
}

export default function GoldPortfolioSimulator() {
  const [goldWeight, setGoldWeight] = useState(10)

  const result = useMemo(() => {
    const w = goldWeight / 100
    const portReturn = w * GOLD_RETURN + (1 - w) * STOCK_RETURN
    const variance =
      w * w * GOLD_VOL * GOLD_VOL +
      (1 - w) * (1 - w) * STOCK_VOL * STOCK_VOL +
      2 * w * (1 - w) * CORRELATION * GOLD_VOL * STOCK_VOL
    const portVol = Math.sqrt(variance)
    const sharpe = (portReturn - RISK_FREE) / portVol

    return { portReturn, portVol, sharpe }
  }, [goldWeight])

  const baseline = useMemo(() => {
    const sharpe0 = (STOCK_RETURN - RISK_FREE) / STOCK_VOL
    return { sharpe0 }
  }, [])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · long-run historical blend
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What adding gold does to a stock portfolio
      </p>

      <div className="mb-6">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          <span>Gold allocation</span>
          <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{goldWeight}%</b>
        </div>
        <input
          type="range" min={0} max={20} step={1} value={goldWeight}
          onChange={e => setGoldWeight(+e.target.value)}
          className="w-full accent-amber-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Remaining {100 - goldWeight}% held in a diversified stock portfolio.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Expected return
          </p>
          <AnimatedNumber
            value={result.portReturn}
            format={pct}
            startFromZero
            className="font-serif text-2xl font-bold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Volatility
          </p>
          <AnimatedNumber
            value={result.portVol}
            format={pct}
            startFromZero
            className="font-serif text-2xl font-bold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Sharpe ratio
          </p>
          <span className={`font-serif text-2xl font-bold block ${result.sharpe >= baseline.sharpe0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
            {result.sharpe.toFixed(2)}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            vs. {baseline.sharpe0.toFixed(2)} at 0% gold
          </p>
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
        Illustrative only, using long-run approximate figures (gold ~7.5% return / ~16% volatility; diversified stocks ~10% / ~15%; ~0.05 historical correlation; 4% risk-free rate). Actual future returns, volatility, and correlation will differ — this models the historical diversification effect, not a forecast for either asset.
      </p>
    </div>
  )
}
