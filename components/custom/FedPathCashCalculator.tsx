'use client'

// Scenario deltas model how a Fed move typically passes through to a national
// average high-yield savings rate over the following weeks — not a guarantee,
// and not specific to any one bank. Defaults: HYSA ~4.15% APY (Bankrate,
// Jul 2026), current target range 3.50%-3.75% held July 29, 2026.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

type Scenario = 'hold' | 'cut25' | 'cut50' | 'hike25'

const SCENARIOS: { id: Scenario; label: string; delta: number }[] = [
  { id: 'hold', label: 'Hold', delta: 0 },
  { id: 'cut25', label: '-0.25%', delta: -0.25 },
  { id: 'cut50', label: '-0.50%', delta: -0.5 },
  { id: 'hike25', label: '+0.25%', delta: 0.25 },
]

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function FedPathCashCalculator() {
  const [cashBalance, setCashBalance] = useState(15000)
  const [currentApy, setCurrentApy] = useState(4.15)
  const [scenario, setScenario] = useState<Scenario>('hold')

  const result = useMemo(() => {
    const delta = SCENARIOS.find((s) => s.id === scenario)?.delta ?? 0
    const projectedApy = Math.max(0, currentApy + delta)
    const currentInterest = (cashBalance * currentApy) / 100
    const projectedInterest = (cashBalance * projectedApy) / 100
    return {
      projectedApy,
      currentInterest,
      projectedInterest,
      annualDelta: projectedInterest - currentInterest,
    }
  }, [cashBalance, currentApy, scenario])

  const maxInterest = Math.max(result.currentInterest, result.projectedInterest, 1)
  const isGain = result.annualDelta >= 0

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · September FOMC scenario
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What a Fed move does to your cash
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Cash in savings / money market</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(cashBalance)}</b>
          </div>
          <input
            type="range" min={0} max={100000} step={500} value={cashBalance}
            onChange={(e) => setCashBalance(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Current APY</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{currentApy.toFixed(2)}%</b>
          </div>
          <input
            type="range" min={0} max={8} step={0.05} value={currentApy}
            onChange={(e) => setCurrentApy(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            September 16 outcome
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`rounded-lg py-2 text-xs sm:text-sm font-medium border transition-colors ${
                  scenario === s.id
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          A {SCENARIOS.find((s) => s.id === scenario)?.label.toLowerCase()} at the September meeting would move your rate to roughly{' '}
          <strong className="text-emerald-700 dark:text-emerald-400">
            <AnimatedNumber value={result.projectedApy} format={(v) => v.toFixed(2) + '%'} />
          </strong>
          , which is{' '}
          <strong className={isGain ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400 dark:text-red-400'}>
            <AnimatedNumber
              value={Math.abs(result.annualDelta)}
              format={(v) => (isGain ? '+' : '-') + money(v) + '/yr'}
              startFromZero
            />
          </strong>{' '}
          on the interest this cash earns you.
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Interest today ({currentApy.toFixed(2)}%)</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.currentInterest)}/yr</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gray-400 dark:bg-gray-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min(100, (result.currentInterest / maxInterest) * 100)}%` }}
            />
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Interest after {SCENARIOS.find((s) => s.id === scenario)?.label} ({result.projectedApy.toFixed(2)}%)</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.projectedInterest)}/yr</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${isGain ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-500 dark:bg-red-400'}`}
              style={{ width: `${Math.min(100, (result.projectedInterest / maxInterest) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-3">
          Models a national-average HYSA repricing roughly in line with a Fed move — your bank may lag or move less. Not a rate quote or financial advice.
        </p>
      </div>
    </div>
  )
}
