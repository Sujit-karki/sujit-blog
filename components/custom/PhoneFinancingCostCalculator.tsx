'use client'

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function PhoneFinancingCostCalculator() {
  const [phonePrice, setPhonePrice] = useState(1099)
  const [months, setMonths] = useState(24)
  const [apr, setApr] = useState(0)
  const [tradeInCredit, setTradeInCredit] = useState(300)

  const result = useMemo(() => {
    const financed = Math.max(0, phonePrice - tradeInCredit)
    let totalPaid = financed
    if (apr > 0) {
      const monthlyRate = apr / 100 / 12
      const payment = (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      totalPaid = payment * months
    }
    const monthlyPayment = totalPaid / months
    const interestCost = totalPaid - financed
    return { financed, totalPaid, monthlyPayment, interestCost }
  }, [phonePrice, months, apr, tradeInCredit])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-400 mb-1">
        Interactive · financing vs. cash
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        What financing a new phone really costs
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Phone price</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(phonePrice)}</b>
          </div>
          <input type="range" min={300} max={2500} step={25} value={phonePrice} onChange={(e) => setPhonePrice(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Trade-in credit</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(tradeInCredit)}</b>
          </div>
          <input type="range" min={0} max={1500} step={25} value={tradeInCredit} onChange={(e) => setTradeInCredit(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>Financing term</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{months} mo</b>
          </div>
          <input type="range" min={6} max={36} step={1} value={months} onChange={(e) => setMonths(+e.target.value)} className="w-full accent-emerald-600" />
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-400 mb-2">
            <span>APR (0 for a true 0% plan)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{apr.toFixed(1)}%</b>
          </div>
          <input type="range" min={0} max={30} step={0.5} value={apr} onChange={(e) => setApr(+e.target.value)} className="w-full accent-red-500" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          After the trade-in, you&apos;d finance{' '}
          <strong className="text-gray-900 dark:text-white">
            <AnimatedNumber value={result.financed} format={money} startFromZero />
          </strong>{' '}
          at{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            <AnimatedNumber value={result.monthlyPayment} format={(v) => money(v) + '/mo'} startFromZero />
          </strong>
          . Total interest over the term:{' '}
          <strong className={result.interestCost > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
            <AnimatedNumber value={result.interestCost} format={money} startFromZero />
          </strong>
          .
        </p>

        <div className="mb-4">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Amount financed</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.financed)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gray-400 dark:bg-gray-500 rounded-lg transition-all duration-500"
              style={{ width: `${Math.min(100, (result.financed / result.totalPaid) * 100)}%` }}
            />
          </div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between font-mono text-[12px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Total paid over {months} months</span>
            <span className="font-medium text-gray-900 dark:text-white">{money(result.totalPaid)}</span>
          </div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-500 ${result.interestCost > 0 ? 'bg-red-500 dark:bg-red-400' : 'bg-emerald-600 dark:bg-emerald-500'}`}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <p className="font-mono text-[11px] text-gray-400 leading-relaxed mt-3">
          A true 0% plan costs the same as cash — the risk is the multi-year carrier commitment, not the APR. Not a specific carrier quote.
        </p>
      </div>
    </div>
  )
}
