'use client'

import { useState, useMemo } from 'react'
import { m } from 'motion/react'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

// Illustrative long-run assumptions, not forecasts: a diversified core
// growing ~6%/yr, with a crypto sleeve modeled across a bull (+15%/yr),
// flat (0%/yr), and bear (-60%/yr, roughly Bitcoin's peak-to-trough draw)
// scenario, each held constant for the full horizon.
const CORE_RETURN = 6
const CRYPTO_BULL = 15
const CRYPTO_FLAT = 0
const CRYPTO_BEAR = -60

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function grow(amount: number, ratePct: number, years: number): number {
  return amount * Math.pow(1 + ratePct / 100, years)
}

export default function CryptoRetirementSimulator() {
  const [portfolioValue, setPortfolioValue] = useState(100000)
  const [cryptoAllocationPct, setCryptoAllocationPct] = useState(3)
  const [yearsToRetirement, setYearsToRetirement] = useState(20)

  const result = useMemo(() => {
    const coreAmt = portfolioValue * (1 - cryptoAllocationPct / 100)
    const cryptoAmt = portfolioValue * (cryptoAllocationPct / 100)
    const coreGrown = grow(coreAmt, CORE_RETURN, yearsToRetirement)

    const bullTotal = coreGrown + grow(cryptoAmt, CRYPTO_BULL, yearsToRetirement)
    const baseTotal = coreGrown + grow(cryptoAmt, CRYPTO_FLAT, yearsToRetirement)
    const bearTotal = coreGrown + grow(cryptoAmt, CRYPTO_BEAR, yearsToRetirement)
    const noCryptoBaseline = grow(portfolioValue, CORE_RETURN, yearsToRetirement)
    const diffVsNoCrypto = baseTotal - noCryptoBaseline

    return { bullTotal, baseTotal, bearTotal, noCryptoBaseline, diffVsNoCrypto }
  }, [portfolioValue, cryptoAllocationPct, yearsToRetirement])

  const maxTotal = Math.max(result.bullTotal, result.baseTotal, result.bearTotal, 1)
  const bars = [
    { label: `Bull (+${CRYPTO_BULL}%/yr crypto)`, value: result.bullTotal, color: 'bg-emerald-600 dark:bg-emerald-500' },
    { label: `Flat (${CRYPTO_FLAT}%/yr crypto)`, value: result.baseTotal, color: 'bg-gray-500 dark:bg-gray-400' },
    { label: `Bear (${CRYPTO_BEAR}%/yr crypto)`, value: result.bearTotal, color: 'bg-red-500 dark:bg-red-400' },
  ]

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · small-sleeve scenario model
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What a small crypto sleeve does to your retirement number
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Current portfolio value</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {money(portfolioValue)}
            </b>
          </div>
          <input
            type="range" min={1000} max={5000000} step={1000} value={portfolioValue}
            onChange={(e) => setPortfolioValue(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Crypto allocation</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {cryptoAllocationPct}%
            </b>
          </div>
          <input
            type="range" min={0} max={20} step={1} value={cryptoAllocationPct}
            onChange={(e) => setCryptoAllocationPct(+e.target.value)}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Years to retirement</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {yearsToRetirement} yrs
            </b>
          </div>
          <input
            type="range" min={1} max={40} step={1} value={yearsToRetirement}
            onChange={(e) => setYearsToRetirement(+e.target.value)}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">
              <span>{bar.label}</span>
              <span className="font-medium text-gray-900 dark:text-white normal-case tracking-normal">
                {money(bar.value)}
              </span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <m.div
                className={`h-full rounded-full ${bar.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, (bar.value / maxTotal) * 100))}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900 p-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Bull (+{CRYPTO_BULL}%/yr crypto)
          </p>
          <AnimatedNumber
            value={result.bullTotal}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-1">
            Flat ({CRYPTO_FLAT}%/yr crypto)
          </p>
          <AnimatedNumber
            value={result.baseTotal}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 p-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-red-500 dark:text-red-400 mb-1">
            Bear ({CRYPTO_BEAR}%/yr crypto)
          </p>
          <AnimatedNumber
            value={result.bearTotal}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white block"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4 text-center">
        <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-1">
          Flat-crypto scenario vs. a portfolio with 0% crypto
        </p>
        <AnimatedNumber
          value={result.diffVsNoCrypto}
          format={(v) => (v >= 0 ? '+' : '−') + money(Math.abs(v))}
          startFromZero
          className={`font-serif text-xl sm:text-2xl font-bold block ${
            result.diffVsNoCrypto >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}
        />
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-4 leading-relaxed">
        Hypothetical illustration only, not financial advice. Assumes a diversified core growing {CORE_RETURN}%/yr and a crypto sleeve held flat for the {yearsToRetirement}-year horizon; bull and bear cases apply +{CRYPTO_BULL}%/yr and {CRYPTO_BEAR}%/yr respectively for the same period. Returns are assumptions, not forecasts — actual crypto outcomes can be worse, including total loss.
      </p>
    </ChartCard>
  )
}
