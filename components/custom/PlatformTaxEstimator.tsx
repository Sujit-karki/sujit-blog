'use client'

import { useState, useMemo } from 'react'
import { m } from 'motion/react'
import ChartCard from './ChartCard'
import AnimatedNumber from './AnimatedNumber'

const SE_TAX_RATE = 0.153
const NET_EARNINGS_FACTOR = 0.9235
const SE_TAX_FLOOR = 400
const BRACKETS = [10, 12, 22, 24, 32]

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function PlatformTaxEstimator() {
  const [grossPayments, setGrossPayments] = useState(22000)
  const [platformFees, setPlatformFees] = useState(2200)
  const [cogs, setCogs] = useState(8000)
  const [shipping, setShipping] = useState(1500)
  const [otherExpenses, setOtherExpenses] = useState(500)
  const [bracket, setBracket] = useState(22)

  const result = useMemo(() => {
    const netProfit = Math.max(
      0,
      grossPayments - platformFees - cogs - shipping - otherExpenses
    )
    const seBase = netProfit * NET_EARNINGS_FACTOR
    const seTax = seBase > SE_TAX_FLOOR ? seBase * SE_TAX_RATE : 0
    const incomeTax = netProfit * (bracket / 100)
    const totalEstimated = seTax + incomeTax
    const monthlySetAside = totalEstimated / 12
    const takeHome = Math.max(0, netProfit - totalEstimated)
    return { netProfit, seTax, incomeTax, totalEstimated, monthlySetAside, takeHome }
  }, [grossPayments, platformFees, cogs, shipping, otherExpenses, bracket])

  const inputs: Array<{
    label: string
    value: number
    setter: (v: number) => void
    max: number
    step: number
    accent: string
  }> = [
    { label: 'Gross platform payments (all 1099-Ks + card payments)', value: grossPayments, setter: setGrossPayments, max: 100000, step: 500, accent: 'accent-emerald-600' },
    { label: 'Platform fees', value: platformFees, setter: setPlatformFees, max: 20000, step: 100, accent: 'accent-amber-500' },
    { label: 'Cost of goods sold', value: cogs, setter: setCogs, max: 50000, step: 250, accent: 'accent-amber-500' },
    { label: 'Shipping paid', value: shipping, setter: setShipping, max: 10000, step: 100, accent: 'accent-amber-500' },
    { label: 'Other expenses (supplies, mileage, etc.)', value: otherExpenses, setter: setOtherExpenses, max: 10000, step: 50, accent: 'accent-amber-500' },
  ]

  const netShare = grossPayments > 0 ? (result.netProfit / grossPayments) * 100 : 0

  return (
    <ChartCard>
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · gross payments to real tax bill
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What that scary 1099-K number actually costs you
      </p>

      <div className="space-y-5 mb-6">
        {inputs.map((inp) => (
          <div key={inp.label}>
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              <span>{inp.label}</span>
              <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">
                {money(inp.value)}
              </b>
            </div>
            <input
              type="range"
              min={0}
              max={inp.max}
              step={inp.step}
              value={inp.value}
              onChange={(e) => inp.setter(+e.target.value)}
              className={`w-full ${inp.accent}`}
            />
          </div>
        ))}

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Your income tax bracket (rough estimate)
          </p>
          <div className="inline-flex flex-wrap border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {BRACKETS.map((b) => (
              <button
                key={b}
                onClick={() => setBracket(b)}
                className={`font-mono text-[12px] tracking-wide px-4 py-2 border-none transition-colors ${
                  bracket === b
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {b}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
          <span>Gross payments (the 1099-K number)</span>
          <span className="font-medium text-gray-900 dark:text-white">{money(grossPayments)}</span>
        </div>
        <div className="h-8 w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          <m.div
            className="h-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-end px-2"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, netShare)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {netShare > 16 && (
              <span className="text-[10px] font-bold text-white whitespace-nowrap">
                {Math.round(netShare)}% is net profit
              </span>
            )}
          </m.div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Taxable net profit</p>
          <AnimatedNumber
            value={result.netProfit}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Self-employment tax</p>
          <AnimatedNumber
            value={result.seTax}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total estimated tax</p>
          <AnimatedNumber
            value={result.totalEstimated}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-400 block"
          />
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Set aside per month</p>
          <AnimatedNumber
            value={result.monthlySetAside}
            format={money}
            startFromZero
            className="font-serif text-xl sm:text-2xl font-semibold text-emerald-700 dark:text-emerald-400 block"
          />
        </div>
      </div>

      <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
        This is an estimate, not tax advice. It simplifies the deductible half of SE tax and ignores the QBI deduction, credits, and state tax. Confirm with a professional before filing.
      </p>
    </ChartCard>
  )
}
