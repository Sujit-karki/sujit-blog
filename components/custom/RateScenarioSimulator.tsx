'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

// Baselines as of mid-July 2026: best HYSA ~4.15% APY (NerdWallet/Bankrate, Forbright),
// 30-yr mortgage 6.55% (Freddie Mac, week of Jul 16). Scenarios model a ±25bp FOMC move.
const BASE_HYSA = 4.15
const BASE_MORTGAGE = 6.55
const BOND_DURATION = 6 // approx effective duration of a core intermediate bond fund

type ScenarioKey = 'cut' | 'hold' | 'hike'

const SCENARIOS: Record<ScenarioKey, { label: string; deltaBp: number; tone: string }> = {
  cut: { label: '25bp Cut', deltaBp: -25, tone: 'emerald' },
  hold: { label: 'Hold', deltaBp: 0, tone: 'gray' },
  hike: { label: '25bp Hike', deltaBp: 25, tone: 'red' },
}

function money(v: number): string {
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function mortgagePayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100 / 12
  const n = years * 12
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}

export default function RateScenarioSimulator() {
  const [scenario, setScenario] = useState<ScenarioKey>('hold')
  const [savings, setSavings] = useState(10000)
  const [mortgageBalance, setMortgageBalance] = useState(400000)

  const result = useMemo(() => {
    const deltaPct = SCENARIOS[scenario].deltaBp / 100

    const hysaRate = Math.max(0.1, BASE_HYSA + deltaPct)
    const hysaInterest = savings * (hysaRate / 100)
    const baseHysaInterest = savings * (BASE_HYSA / 100)

    const mortgageRate = Math.max(1, BASE_MORTGAGE + deltaPct)
    const payment = mortgagePayment(mortgageBalance, mortgageRate, 30)
    const basePayment = mortgagePayment(mortgageBalance, BASE_MORTGAGE, 30)

    // Rough bond-fund price sensitivity: %price change ≈ -duration × Δyield
    const bondChangePct = -BOND_DURATION * deltaPct

    return {
      hysaRate,
      hysaInterest,
      hysaDelta: hysaInterest - baseHysaInterest,
      mortgageRate,
      payment,
      paymentDelta: payment - basePayment,
      bondChangePct,
    }
  }, [scenario, savings, mortgageBalance])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · July 28–29 FOMC scenario
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What a hike, hold, or cut does to your money
      </p>

      <div className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-3">
          Pick a scenario
        </p>
        <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                scenario === key
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {SCENARIOS[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>HYSA balance</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(savings)}</b>
          </div>
          <input
            type="range" min={1000} max={100000} step={1000} value={savings}
            onChange={e => setSavings(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Mortgage balance</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(mortgageBalance)}</b>
          </div>
          <input
            type="range" min={100000} max={1000000} step={10000} value={mortgageBalance}
            onChange={e => setMortgageBalance(+e.target.value)}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-1">
            HYSA @ {result.hysaRate.toFixed(2)}%
          </p>
          <AnimatedNumber
            value={result.hysaInterest}
            format={money}
            startFromZero
            className="font-serif text-2xl font-bold text-gray-900 dark:text-white block"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            annual interest, {result.hysaDelta >= 0 ? '+' : ''}{money(result.hysaDelta)} vs. today&apos;s {BASE_HYSA}%
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-1">
            Mortgage @ {result.mortgageRate.toFixed(2)}%
          </p>
          <AnimatedNumber
            value={result.payment}
            format={money}
            startFromZero
            className="font-serif text-2xl font-bold text-gray-900 dark:text-white block"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            monthly payment (30-yr), {result.paymentDelta >= 0 ? '+' : ''}{money(result.paymentDelta)} vs. today&apos;s {BASE_MORTGAGE}%
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-1">
            Core bond fund
          </p>
          <span className={`font-serif text-2xl font-bold block ${result.bondChangePct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {result.bondChangePct >= 0 ? '+' : ''}{result.bondChangePct.toFixed(1)}%
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            rough price move, ~{BOND_DURATION}-yr duration fund
          </p>
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-4">
        Illustrative only. HYSA and mortgage baselines reflect published mid-July 2026 rates (Forbright ~4.15% APY; Freddie Mac 30-yr average 6.55%). Bond-fund move uses a simplified duration approximation (%Δprice ≈ −duration × Δyield), ignoring convexity, credit spreads, and fees. Not a rate forecast.
      </p>
    </div>
  )
}
