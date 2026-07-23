'use client'

// Defaults: FDIC national avg savings 0.38% (Jul 2026); best HYSA ~4.15% APY
// (Bankrate, Jul 2026); avg card APR on interest-accruing accounts 22.15%
// (Fed G.19, Q2 2026). These are national averages, not a personal quote.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

const NATIONAL_SAVINGS_APY = 0.38
const HYSA_APY = 4.15
const CARD_APR = 22.15

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function RateHoldCashCalculator() {
  const [cashBalance, setCashBalance] = useState(10000)
  const [cardBalance, setCardBalance] = useState(5000)

  const result = useMemo(() => {
    const annualLostInterest = (cashBalance * (HYSA_APY - NATIONAL_SAVINGS_APY)) / 100
    const annualCardCost = (cardBalance * CARD_APR) / 100
    const monthlyCardCost = annualCardCost / 12
    return { annualLostInterest, annualCardCost, monthlyCardCost }
  }, [cashBalance, cardBalance])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · what a rate hold costs you
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        The gap that matters more than the Fed
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Cash sitting in a low-yield account</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(cashBalance)}</b>
          </div>
          <input
            type="range" min={0} max={100000} step={500} value={cashBalance}
            onChange={e => setCashBalance(+e.target.value)}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Credit card balance you carry</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(cardBalance)}</b>
          </div>
          <input
            type="range" min={0} max={30000} step={100} value={cardBalance}
            onChange={e => setCardBalance(+e.target.value)}
            className="w-full accent-red-500"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Leaving that cash in a {NATIONAL_SAVINGS_APY}% account instead of a {HYSA_APY}% HYSA costs you{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.annualLostInterest} format={v => money(v) + '/yr'} startFromZero />
          </strong>
          . That card balance at {CARD_APR}% APR costs{' '}
          <strong className="text-red-500 dark:text-red-400">
            <AnimatedNumber value={result.monthlyCardCost} format={v => money(v) + '/mo'} startFromZero />
          </strong>{' '}
          in interest — a Fed hold changes neither number.
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Annual interest lost on idle cash</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.annualLostInterest)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min(100, (result.annualLostInterest / 3000) * 100)}%` }}
            />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Annual credit card interest cost</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.annualCardCost)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-red-500 dark:bg-red-400 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min(100, (result.annualCardCost / 6000) * 100)}%` }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          Uses the FDIC national average savings rate ({NATIONAL_SAVINGS_APY}%), a representative top HYSA rate ({HYSA_APY}%), and the Fed&apos;s Q2 2026 average APR on interest-accruing card accounts ({CARD_APR}%) — not a quote for your specific accounts.
        </p>
      </div>
    </div>
  )
}
