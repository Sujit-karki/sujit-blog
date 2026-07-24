'use client'

import { useState, useMemo } from 'react'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

function pct(v: number): string {
  return (v >= 0 ? '+' : '') + v.toFixed(1) + '%'
}

export default function RealIncomeCalculator() {
  const [annualIncome, setAnnualIncome] = useState(60000)
  const [raisePct, setRaisePct] = useState(3)
  const [inflationPct, setInflationPct] = useState(4.1)

  const result = useMemo(() => {
    const nominalNew = annualIncome * (1 + raisePct / 100)
    const realNew = nominalNew / (1 + inflationPct / 100)
    const realChangePct = annualIncome > 0 ? (realNew / annualIncome - 1) * 100 : 0
    const breakEvenRaise = inflationPct
    return { nominalNew, realNew, realChangePct, breakEvenRaise }
  }, [annualIncome, raisePct, inflationPct])

  const losingGround = result.realChangePct < 0

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · your raise vs. inflation
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        Is your paycheck actually keeping up?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Current annual income</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {money(annualIncome)}
            </b>
          </div>
          <input
            type="range" min={0} max={1000000} step={1000} value={annualIncome}
            onChange={(e) => setAnnualIncome(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Your raise</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {raisePct.toFixed(1)}%
            </b>
          </div>
          <input
            type="range" min={0} max={20} step={0.5} value={raisePct}
            onChange={(e) => setRaisePct(+e.target.value)}
            className="w-full accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Inflation rate (PCE or CPI, your choice)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
              {inflationPct.toFixed(1)}%
            </b>
          </div>
          <input
            type="range" min={0} max={15} step={0.1} value={inflationPct}
            onChange={(e) => setInflationPct(+e.target.value)}
            className="w-full accent-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-1">New nominal income</p>
          <AnimatedNumber
            value={result.nominalNew}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-1">New real (inflation-adjusted) income</p>
          <AnimatedNumber
            value={result.realNew}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-1">Real change in purchasing power</p>
          <AnimatedNumber
            value={result.realChangePct}
            format={pct}
            startFromZero
            className={`font-serif text-xl sm:text-2xl font-bold block ${
              losingGround ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-1">Break-even raise needed</p>
          <span className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white block">
            {result.breakEvenRaise.toFixed(1)}%
          </span>
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-400 mt-4 leading-relaxed">
        Illustration using a chosen inflation rate; your personal inflation rate differs from the national PCE/CPI figures based on your own spending mix. Not financial advice.
      </p>
    </ChartCard>
  )
}
