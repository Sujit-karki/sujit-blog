'use client'

// Bridges the gap between a new grad's target salary and their actual offer
// (or a stretch of unemployment) with the monthly side income needed to cover it.

import { useState, useMemo } from 'react'
import AnimatedNumber from './AnimatedNumber'

function money(v: number): string {
  return '$' + Math.round(v).toLocaleString('en-US')
}

export default function NewGradIncomeGapCalculator() {
  const [targetSalary, setTargetSalary] = useState(56153)
  const [actualSalary, setActualSalary] = useState(0)
  const [bridgeMonths, setBridgeMonths] = useState(6)
  const [taxReserve, setTaxReserve] = useState(28)

  const { annualGap, monthlyGross } = useMemo(() => {
    const gap = Math.max(0, targetSalary - actualSalary)
    const net = gap / 12
    const gross = net / (1 - taxReserve / 100)
    return { annualGap: gap, monthlyGross: gross }
  }, [targetSalary, actualSalary, taxReserve])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <p className="font-mono text-[11px] tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-1">
        Interactive · bridge your own gap
      </p>
      <p className="font-serif text-xl mb-5 text-gray-900 dark:text-white">
        How much side income would close your income gap?
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Target starting salary</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(targetSalary)}</b>
          </div>
          <input type="range" min={0} max={300000} step={1000} value={targetSalary} onChange={e => setTargetSalary(+e.target.value)} className="w-full accent-amber-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Actual salary (or $0 if unemployed)</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{money(actualSalary)}</b>
          </div>
          <input type="range" min={0} max={300000} step={1000} value={actualSalary} onChange={e => setActualSalary(+e.target.value)} className="w-full accent-amber-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Months to bridge</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{bridgeMonths}</b>
          </div>
          <input type="range" min={1} max={24} step={1} value={bridgeMonths} onChange={e => setBridgeMonths(+e.target.value)} className="w-full accent-amber-600" />
        </div>
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            <span>Self-employment tax reserve</span>
            <b className="text-base text-gray-900 dark:text-white normal-case tracking-normal">{taxReserve}%</b>
          </div>
          <input type="range" min={0} max={50} step={1} value={taxReserve} onChange={e => setTaxReserve(+e.target.value)} className="w-full accent-amber-600" />
        </div>
      </div>

      <div className="pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-serif text-lg sm:text-xl leading-snug mb-4 text-gray-900 dark:text-white">
          Your annual gap is <strong>{money(annualGap)}</strong>. Over {bridgeMonths} months, closing it takes about{' '}
          <strong className="text-amber-600 dark:text-amber-400">{money(monthlyGross)}</strong> a month in gross side income,
          after setting aside {taxReserve}% for self-employment taxes.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Annual income gap</p>
            <AnimatedNumber value={annualGap} format={money} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Monthly gross side income needed</p>
            <AnimatedNumber value={monthlyGross} format={money} startFromZero className="font-serif text-xl font-bold text-amber-600 dark:text-amber-400" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Tax reserve applied</p>
            <AnimatedNumber value={taxReserve} format={v => `${v.toFixed(0)}%`} startFromZero className="font-serif text-xl font-bold text-gray-900 dark:text-white" />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Estimate only — not financial advice.</p>

        <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm">
            <caption className="sr-only">New grad income gap — data table</caption>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Target salary</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(targetSalary)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Actual salary</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(actualSalary)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Annual gap</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(annualGap)}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Bridge months</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{bridgeMonths}</td></tr>
              <tr className="border-b border-gray-100 dark:border-gray-800"><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Tax reserve</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{taxReserve}%</td></tr>
              <tr><td className="px-3 py-2 text-gray-500 dark:text-gray-400">Monthly gross needed</td><td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">{money(monthlyGross)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
